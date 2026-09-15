function Timer() {
  if (tmp.N.start == 1) tmp.N.level = tmp.N.level.add(1), tmp.N.start = new Decimal(1), tmp.N.Start = setTimeout(Timer, 10000)
  }

IMAGE_STRING =`https://i.postimg.cc/gJyyHjs7/Methylamine-svg-removebg-preview.png
https://i.postimg.cc/157GHL0y/Propane-2-D-flat-removebg-preview.png
https://i.postimg.cc/9M2Z0V2Y/istockphoto-1065479358-170667a-removebg-preview-2-removebg-preview.png
https://i.postimg.cc/1X5F0Hfg/industrial-chemicals4-250x250-250x250-250x250-removebg-preview-removebg-preview.png
https://i.postimg.cc/BnDjKyMY/Fenyloaceton-svg-removebg-preview.png
https://i.postimg.cc/N0kLNXhR/Acetone-2-D-skeletal-svg-removebg-preview.png
https://i.postimg.cc/tRMJmycv/1920px-Ethanol-2-D-flat-svg-removebg-preview.png
https://i.postimg.cc/t40Tpkph/Difference-Between-Phenylamine-and-Aminobenzene-Figure-1-removebg-preview.png
https://i.postimg.cc/Y2Z2zR4J/molecular-structure-PROD0000094-removebg-preview.png
https://i.postimg.cc/xjMMw6rS/Butane-2-D-flat-removebg-preview.png
https://i.postimg.cc/vHSn9kff/003-methane-formula-removebg-preview.png
https://i.postimg.cc/KYmgyb2X/octane01-removebg-preview.png
https://i.postimg.cc/QdQ0bjbv/1-Bromo-2-methylpropane-removebg-preview-removebg-preview.png
https://i.postimg.cc/qMk55ht4/image-removebg-preview-removebg-preview.png
https://i.postimg.cc/CLk65GWG/generate-image-removebg-preview-removebg-preview.png
https://i.postimg.cc/MTyvvK8K/chemical-structure-cas-624-16-8-jpg-650-removebg-preview-removebg-preview.png`

IMAGE_LIST = IMAGE_STRING.split("\n")

WORD_STRING =`Methanamine
Propane
Pentane
Trichloromethane
Phenyl-2-propanone
Propanone
Ethanol
Phenylamine
2-Chlorophenol
Butane
Methane
Octane
1-Bromo-2-methylpropane
1-Fluoropentane
1-Chloro-1-fluoro-pentane
4-Decanone`

WORD_LIST = WORD_STRING.split("\n")

ALT_STRING =`Methylamine
Tricarbane
Quintane
1-Trichloro-methane
1-Phenyl-2-propanone
Propan-2-one
Ethylol
Benzenamine
2-Hydroxychlorobenzene
Tetracarbane
Carbane
Octane
1-Bromo-2-methyl-propane
1-Fluoro-pentane
1-Chlorofluoropentane
Decanone`

ALT_LIST = ALT_STRING.split("\n")

HINT_STRING =`HINT FOR FAILED WORD: Methan_ _ _ _ _
HINT FOR FAILED WORD: Prop_ _ _
HINT FOR FAILED WORD: Pent_ _ _
HINT FOR FAILED WORD: Tri_ _ _ _ _ _methane
HINT FOR FAILED WORD: Ph_ _ _ _-2-propan_ _ _
HINT FOR FAILED WORD: Propan_ _ _
HINT FOR FAILED WORD: Ethan_ _
HINT FOR FAILED WORD: _ _ _ _ _ _amine
HINT FOR FAILED WORD: 2-_ _ _ _ _ _phen_ _
HINT FOR FAILED WORD: _ _ _ane
HINT FOR FAILED WORD: _ _ _ _ane
HINT FOR FAILED WORD: _ _ _ane
HINT FOR FAILED WORD: 1-_ _ _ _ _-2-me_ _ _ _propane
HINT FOR FAILED WORD: 1-_ _ _ _ _ _pent_ _ _
HINT FOR FAILED WORD: 1-_ _ _ _ _ _-1-_ _ _ _ _ _-pent_ _ _
HINT FOR FAILED WORD: _-Decan_ _ _`

HINT_LIST = HINT_STRING.split("\n")

function getRandomWordfi(){
    player.N.id = Math.floor(Math.random()*WORD_LIST.length)
    player.N.word = WORD_LIST[player.N.id]
    player.N.alt = ALT_LIST[player.N.id]
    player.N.image = IMAGE_LIST[player.N.id] 

}

function getRandomWord(){
    if(player.N.Otext.toLowerCase() != player.N.word.toLowerCase() && player.N.Otext.toLowerCase() != player.N.alt.toLowerCase()) player.N.Otext = HINT_LIST[player.N.id]
    if(player.N.Otext.toLowerCase() != player.N.word.toLowerCase() && options.disableParticles == true && player.N.Otext.toLowerCase() != player.N.alt.toLowerCase()) player.N.points = player.N.points.sub(player.N.points.times(tmp.N.PMM)), makeShinies(PartNN, 10), player.N.combo = player.N.combo.times(tmp.N.CM), player.N.failed = player.N.failed.add(1)
    if(player.N.Otext.toLowerCase() != player.N.word.toLowerCase() && options.disableParticles == false && player.N.Otext.toLowerCase() != player.N.alt.toLowerCase()) player.N.points = player.N.points.sub(player.N.points.times(tmp.N.PMM)), player.N.combo = player.N.combo.times(tmp.N.CM), player.N.failed = player.N.failed.add(1)
    if(player.N.Otext.toLowerCase() == player.N.word.toLowerCase() && options.disableParticles == true || player.N.Otext.toLowerCase() == player.N.alt.toLowerCase() && options.disableParticles == true) player.N.Otext = '', player.N.combo = player.N.combo.add(new Decimal(1).times(tmp.N.mult)), makeShinies(PartN, 10), player.N.points = player.N.points.add(tmp.N.add)
    if(player.N.Otext.toLowerCase() == player.N.word.toLowerCase() && options.disableParticles == false || player.N.Otext.toLowerCase() == player.N.alt.toLowerCase() && options.disableParticles == false) player.N.Otext = '', player.N.combo = player.N.combo.add(1), player.N.points = player.N.points.add(tmp.N.add)
    player.N.id = Math.floor(Math.random()*WORD_LIST.length)
    player.N.word = WORD_LIST[player.N.id]
    player.N.alt = ALT_LIST[player.N.id]
    player.N.image = IMAGE_LIST[player.N.id]
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }

addLayer("E", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    }
})

addNode("Ex", {
    row: "side",
    color: "#FFFFFF",

    layerShown() {
        if (hasAchievement('A', 15)) return true
        else return false
    },

    tooltip() {
        if (player.p.Node < 1) return "ON: Turning on text."
        else return "OFF: Turning off text."
    },

    canClick() { return true },

    onClick() {
        if (player.p.Node < 1) player.p.Node = player.p.Node.add(1)
        else player.p.Node = player.p.Node.times(0)
    },
})

addLayer("R", {
    row: "side",
    color: "#ffa500",

    layerShown() {
       return true
    },
    tooltip() {
       return "Reviews"
    },

    tabFormat: [
        ['display-text', '<h1>Reviews Of The Periodic Table Tree</h1><div>Link To Create A Review: <a href="https://forums.moddingtree.com/t/reviews-for-the-periodic-table-tree/702" target="_blank" rel="noopener noreferrer">Reviews</a>'],
        "blank", "blank", "blank", "blank",
        ['display-text', '<u>' + '&nbsp'.repeat(70) + '</u>'],
        "blank",
        ['display-image', 'https://i.postimg.cc/yNpdYhP7/Screenshot-2022-07-31-015607.jpg'],
        ['display-text', 'Rating: ★✰✰✰✰'],
        ['display-text', '<u>' + '&nbsp'.repeat(70) + '</u>'],
        "blank",
        ['display-image', 'https://i.postimg.cc/5yh12Qmy/Screenshot-2022-07-31-174637.jpg', { width: '600px'}],
        ['display-text', 'Rating: ★★★★✫'],
        ['display-text', '<u>' + '&nbsp'.repeat(70) + '</u>'],
        "blank",
        ['display-image', 'https://i.postimg.cc/sDdQBXKd/Screenshot-2022-08-01-014926.jpg', { width: '600px'}],
        ['display-text', 'Rating: ★★★★✰'],
        ['display-text', '<u>' + '&nbsp'.repeat(70) + '</u>'],
        "blank",
        ['display-image', 'https://i.postimg.cc/FHn8r8bz/Screenshot-2022-08-01-110018.jpg', { width: '600px'}],
        ['display-text', 'Rating: ★★★★★'],
        ['display-text', '<u>' + '&nbsp'.repeat(70) + '</u>'],
    ]
})

var _0x61be=["\x43\x68","\x73\x69\x64\x65","\x23\x30\x30\x30\x30\x30\x30","\x23\x66\x66\x66\x66\x66\x66","\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x49\x54\x65\x78\x74","\x48\x65","\x48\x65\x69\x73\x65\x6E\x62\x75\x72\x67","\x49\x20\x6E\x65\x65\x64\x20\x61\x20\x6E\x65\x77\x20\x64\x75\x73\x74\x20\x66\x69\x6C\x74\x65\x72\x20\x66\x6F\x72\x20\x6D\x79\x20\x48\x6F\x6F\x76\x65\x72\x20\x4D\x61\x78\x20\x45\x78\x74\x72\x61\x63\x74\x20\x50\x72\x65\x73\x73\x75\x72\x65\x20\x50\x72\x6F\x20\x6D\x6F\x64\x65\x6C\x20\x36\x30","\x54\x65\x73\x74\x69\x63\x6C\x65","\x42\x61\x44\x20\x42\x72\x65\x61\x6B\x49\x6E\x47","\x49\x20\x61\x6D\x20\x6E\x6F\x74\x20\x74\x75\x72\x6E\x69\x6E\x67\x20\x64\x6F\x77\x6E\x20\x74\x68\x65\x20\x6D\x6F\x6E\x65\x79\x21\x20\x49\x20\x61\x6D\x20\x74\x75\x72\x6E\x69\x6E\x67\x20\x64\x6F\x77\x6E\x20\x79\x6F\x75\x21\x20\x59\x6F\x75\x20\x67\x65\x74\x20\x69\x74\x3F\x20\x49\x20\x77\x61\x6E\x74\x20\x6E\x6F\x74\x68\x69\x6E\x67\x20\x74\x6F\x20\x64\x6F\x20\x77\x69\x74\x68\x20\x79\x6F\x75\x21\x20\x45\x76\x65\x72\x20\x73\x69\x6E\x63\x65\x20\x49\x20\x6D\x65\x74\x20\x79\x6F\x75\x2C\x20\x65\x76\x65\x72\x79\x74\x68\x69\x6E\x67\x20\x49\x20\x65\x76\x65\x72\x20\x63\x61\x72\x65\x64\x20\x61\x62\x6F\x75\x74\x20\x69\x73\x20\x67\x6F\x6E\x65\x21\x20\x52\x75\x69\x6E\x65\x64\x2C\x20\x74\x75\x72\x6E\x65\x64\x20\x74\x6F\x20\x73\x2A\x2A\x74\x2C\x20\x64\x65\x61\x64\x2C\x20\x65\x76\x65\x72\x20\x73\x69\x6E\x63\x65\x20\x49\x20\x68\x6F\x6F\x6B\x65\x64\x20\x75\x70\x20\x77\x69\x74\x68\x20\x74\x68\x65\x20\x67\x72\x65\x61\x74\x20\x48\x65\x69\x73\x65\x6E\x62\x65\x72\x67\x21","\x6D\x65\x74\x68\x61\x6D\x70\x68\x65\x74\x61\x6D\x69\x6E\x65","\x4C\x61\x62\x20\x4E\x6F\x74\x65\x73","\x4F\x6E\x65","\x4E\x6F\x74\x65\x20\x23\x31","\x20\x2D\x6A\x75\x73\x74\x20\x74\x68\x65\x20\x6F\x74\x68\x65\x72\x20\x64\x61\x79\x2C\x20\x68\x65\x20\x74\x6F\x6C\x64\x20\x6D\x65\x20\x69\x74\x20\x77\x61\x73\x20\x68\x69\x73\x20\x62\x69\x72\x74\x68\x64\x61\x79\x2E\x20\x49\x20\x6D\x65\x61\x6E\x2C\x20\x77\x68\x6F\x20\x63\x61\x72\x65\x73\x3F\x20\x49\x74\x27\x73\x20\x6E\x6F\x74\x20\x6C\x69\x6B\x65\x20\x61\x6E\x79\x6F\x6E\x65\x27\x73\x20\x67\x6F\x69\x6E\x67\x20\x74\x6F\x20\x67\x65\x74\x20\x68\x69\x6D\x20\x61\x6E\x79\x74\x68\x69\x6E\x67\x20\x61\x6E\x79\x77\x61\x79\x2E\x20\x4E\x6F\x74\x20\x6C\x69\x6B\x65\x20\x61\x6E\x79\x6F\x6E\x65\x20\x63\x6F\x75\x6C\x64\x2E\x20\x54\x68\x65\x20\x64\x75\x64\x65\x73\x20\x61\x20\x77\x65\x69\x72\x64\x6F\x2C\x20\x79\x6F\x75\x20\x73\x68\x6F\x75\x6C\x64\x20\x73\x74\x61\x79\x20\x61\x77\x61\x79\x20\x66\x72\x6F\x6D\x20\x27\x65\x6D\x2E\x20\x41\x6E\x79\x77\x61\x79\x20\x67\x6F\x74\x74\x61\x20\x67\x6F\x2C\x20\x67\x6F\x74\x20\x61\x20\x63\x6C\x69\x65\x6E\x74\x20\x77\x68\x6F\x27\x73\x20\x70\x72\x6F\x62\x61\x62\x6C\x79\x20\x61\x6C\x72\x65\x61\x64\x79\x20\x61\x74\x20\x4C\x69\x74\x68\x69\x75\x6D\x21","\x54\x77\x6F","\x4E\x6F\x74\x65\x20\x23\x32","\x43\x6F\x63\x65\x6E\x74\x72\x61\x74\x65\x20\x74\x68\x65\x20\x70\x65\x72\x63\x69\x70\x69\x74\x61\x74\x65\x2E\x20\x46\x69\x6C\x74\x65\x72\x20\x6F\x75\x74\x20\x74\x6F\x20\x70\x75\x72\x69\x66\x79\x2E\x20\x50\x6F\x75\x72\x20\x74\x6F\x20\x63\x72\x79\x73\x74\x61\x6C\x69\x7A\x65\x2E\x20\x43\x75\x2D\x2E\x20\x44\x61\x6D\x6E\x20\x69\x74\x2E\x20\x49\x20\x63\x61\x6E\x27\x74\x20\x6B\x65\x65\x70\x20\x64\x6F\x69\x6E\x67\x20\x74\x68\x69\x73\x20\x69\x66\x20\x49\x20\x64\x6F\x6E\x27\x74\x20\x68\x61\x76\x65\x20\x61\x20\x73\x75\x66\x66\x69\x63\x69\x65\x6E\x74\x20\x73\x75\x70\x70\x6C\x79\x2E\x20\x54\x68\x61\x6E\x6B\x66\x75\x6C\x6C\x79\x2C\x20\x49\x20\x68\x61\x76\x2D","\x54\x68\x72\x65\x65","\x4E\x6F\x74\x65\x20\x23\x33","\x44\x69\x64\x20\x79\x6F\x75\x20\x70\x65\x72\x68\x61\x70\x73\x20\x66\x6F\x72\x67\x65\x74\x20\x74\x6F\x20\x74\x61\x6B\x65\x20\x79\x6F\x75\x72\x20\x70\x61\x69\x6E\x6B\x69\x6C\x6C\x65\x72\x73\x20\x74\x68\x69\x73\x20\x6D\x6F\x72\x6E\x69\x6E\x67\x3F\x20\x48\x61\x73\x20\x79\x6F\x75\x72\x20\x6D\x69\x6E\x64\x20\x67\x6F\x6E\x65\x20\x66\x75\x7A\x7A\x79\x20\x66\x72\x6F\x6D\x20\x74\x68\x65\x20\x70\x61\x69\x6E\x3F\x20\x4F\x72\x20\x69\x73\x20\x74\x68\x69\x73\x20\x70\x65\x72\x68\x61\x70\x73\x20\x61\x20\x67\x65\x6E\x69\x74\x69\x63\x61\x6C\x20\x74\x68\x69\x6E\x67\x2C\x20\x62\x65\x63\x61\x75\x73\x65\x20\x72\x69\x67\x68\x74\x20\x6E\x6F\x77\x20\x6E\x6F\x20\x6F\x6E\x65\x20\x63\x6F\x75\x6C\x64\x20\x70\x6F\x73\x73\x69\x62\x6C\x65\x20\x63\x6F\x6D\x70\x72\x65\x68\x65\x6E\x64\x20\x77\x68\x61\x74\x27\x73\x20\x63\x6F\x6D\x69\x6E\x67\x20\x6F\x75\x74\x20\x6F\x66\x20\x79\x6F\x75\x72\x20\x6D\x6F\x75\x74\x68\x2E\x20\x45\x69\x74\x68\x65\x72\x20\x79\x6F\x75\x20\x67\x69\x76\x65\x20\x75\x70\x20\x61\x6E\x64\x20\x77\x65\x20\x64\x69\x65\x20\x6F\x72\x20\x79\x6F\x75\x20\x73\x65\x6E\x64\x20\x74\x68\x65\x6D\x20\x6F\x6E\x20\x74\x68\x65\x69\x72\x20\x6D\x65\x72\x72\x79\x20\x77\x61\x79\x20\x74\x6F\x20\x74\x68\x65\x20\x6E\x65\x78\x74\x20\x6C\x61\x79\x65\x72\x2E","\x46\x6F\x75\x72","\x4E\x6F\x74\x65\x20\x23\x34","\x54\x68\x65\x20\x75\x6E\x69\x76\x65\x72\x73\x65\x20\x69\x73\x20\x72\x61\x6E\x64\x6F\x6D\x2E\x20\x49\x74\x27\x73\x20\x6E\x6F\x74\x20\x69\x6E\x65\x76\x69\x74\x61\x62\x6C\x65\x2E\x20\x49\x74\x27\x73\x20\x73\x69\x6D\x70\x6C\x65\x20\x63\x68\x61\x6F\x73\x2E\x20\x49\x74\x27\x73\x20\x73\x75\x62\x61\x74\x6F\x6D\x69\x63\x20\x70\x61\x72\x74\x69\x63\x6C\x65\x73\x20\x69\x6E\x20\x65\x6E\x64\x6C\x65\x73\x73\x2C\x20\x61\x69\x6D\x6C\x65\x73\x73\x20\x63\x6F\x6C\x6C\x69\x73\x69\x6F\x6E\x2E\x20\x54\x68\x61\x74\x27\x73\x20\x77\x68\x61\x74\x20\x73\x63\x69\x65\x6E\x63\x65\x20\x74\x65\x61\x63\x68\x65\x73\x20\x75\x73\x2C\x20\x62\x75\x74\x20\x77\x68\x61\x74\x20\x69\x73\x20\x74\x68\x69\x73\x20\x73\x61\x79\x69\x6E\x67\x3F\x20\x57\x68\x61\x74\x20\x69\x73\x20\x69\x74\x20\x74\x65\x6C\x6C\x69\x6E\x67\x20\x75\x73\x2C\x20\x77\x68\x65\x6E\x20\x6F\x6E\x20\x74\x68\x65\x20\x76\x65\x72\x79\x20\x6E\x69\x67\x68\x74\x20\x74\x68\x61\x74\x20\x74\x68\x69\x73\x20\x6D\x61\x6E\x27\x73\x20\x64\x61\x75\x67\x68\x74\x65\x72\x20\x64\x69\x65\x73\x2C\x20\x69\x74\x27\x73\x20\x6D\x65\x20\x77\x68\x6F\x27\x73\x20\x68\x61\x76\x69\x6E\x67\x20\x61\x20\x64\x72\x69\x6E\x6B\x20\x77\x69\x74\x68\x20\x68\x69\x6D\x3F\x20\x48\x6F\x77\x20\x63\x61\x6E\x20\x74\x68\x61\x74\x20\x62\x65\x20\x72\x61\x6E\x64\x6F\x6D\x3F","\x46\x69\x76\x65","\x4E\x6F\x74\x65\x20\x23\x35","\x48\x61\x73\x6E\x27\x74\x20\x69\x74\x20\x62\x65\x65\x6E\x20\x63\x6C\x65\x61\x72\x20\x73\x69\x6E\x63\x65\x20\x74\x68\x65\x20\x62\x65\x67\x69\x6E\x6E\x69\x6E\x67\x3F\x20\x43\x61\x6E\x27\x74\x20\x79\x6F\x75\x20\x73\x65\x65\x20\x74\x68\x65\x20\x77\x72\x69\x74\x74\x69\x6E\x67\x20\x6F\x6E\x20\x74\x68\x65\x20\x77\x61\x6C\x6C\x73\x3F\x20\x49\x27\x6D\x20\x6E\x6F\x74\x20\x69\x6E\x20\x74\x68\x65\x20\x6D\x6F\x6E\x65\x79\x20\x62\x75\x73\x69\x6E\x65\x73\x73\x20\x6E\x6F\x72\x20\x74\x68\x65\x20\x63\x68\x65\x6D\x69\x63\x61\x6C\x20\x6F\x6E\x65\x2E\x20\x49\x27\x6D\x20\x69\x6E\x20\x74\x68\x65\x20\x65\x6D\x70\x69\x72\x65\x20\x62\x75\x73\x69\x6E\x65\x73\x73\x20\x61\x6E\x64\x20\x74\x68\x65\x20\x6F\x6E\x6C\x79\x20\x77\x61\x79\x20\x74\x68\x69\x73\x20\x63\x61\x6E\x20\x66\x75\x6E\x63\x74\x69\x6F\x6E\x20\x69\x73\x20\x77\x69\x74\x68\x20\x79\x6F\x75\x20\x61\x73\x20\x74\x68\x65\x20\x64\x65\x61\x6C\x65\x72\x20\x61\x6E\x64\x20\x6D\x65\x20\x61\x73\x20\x74\x68\x65\x20\x63\x6F\x6F\x6B\x2E\x20\x49\x74\x27\x73\x20\x61\x20\x6F\x6E\x65\x2D\x77\x61\x79\x20\x73\x74\x72\x65\x65\x74\x20\x4A\x2D","\x53\x69\x78","\x4E\x6F\x74\x65\x20\x23\x36","\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3C\x64\x69\x76\x3E\x59\x6F\x75\x20\x70\x72\x6F\x64\x75\x63\x65\x20\x61\x20\x6D\x65\x74\x68\x20\x74\x68\x61\x74\x27\x73\x20\x37\x30\x25\x20\x70\x75\x72\x65\x2C\x20\x69\x66\x20\x79\x6F\x75\x27\x72\x65\x20\x6C\x75\x63\x6B\x79\x2E\x20\x57\x68\x61\x74\x20\x49\x20\x70\x72\x6F\x64\x75\x63\x65\x20\x69\x73\x20\x39\x39\x2E\x31\x25\x20\x70\x75\x72\x65\x2E\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3C\x64\x69\x76\x3E\x53\x6F\x3F\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3C\x64\x69\x76\x3E\x53\x6F\x2E\x2E\x2E\x20\x69\x74\x27\x73\x20\x67\x72\x61\x64\x65\x20\x73\x63\x68\x6F\x6F\x6C\x20\x74\x65\x65\x2D\x62\x61\x6C\x6C\x20\x76\x73\x2E\x20\x54\x68\x65\x20\x4E\x65\x77\x20\x59\x6F\x72\x6B\x20\x59\x61\x6E\x6B\x65\x65\x73\x2E\x20\x59\x6F\x75\x72\x73\x20\x69\x73\x20\x6A\x75\x73\x74\x20\x73\x6F\x6D\x65\x20\x74\x65\x70\x69\x64\x2E\x2E\x2E\x20\x6F\x66\x66\x2D\x62\x72\x61\x6E\x64\x2C\x20\x67\x65\x6E\x65\x72\x69\x63\x20\x63\x6F\x6C\x61\x2E\x20\x57\x68\x61\x74\x20\x49\x27\x6D\x20\x6D\x61\x6B\x69\x6E\x67\x20\x69\x73\x20\x63\x6C\x61\x73\x73\x69\x63\x20\x43\x6F\x6B\x65\x2E\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3C\x64\x69\x76\x3E\x41\x6C\x6C\x20\x72\x69\x67\x68\x74\x2E\x20\x4F\x6B\x61\x79\x2E\x20\x53\x6F\x2C\x20\x75\x6D\x2E\x2E\x2E\x20\x49\x66\x20\x77\x65\x20\x6A\x75\x73\x74\x20\x77\x61\x73\x74\x65\x20\x79\x6F\x75\x20\x72\x69\x67\x68\x74\x20\x68\x65\x72\x65\x2C\x20\x72\x69\x67\x68\x74\x20\x6E\x6F\x77\x2C\x20\x61\x6E\x64\x20\x6C\x65\x61\x76\x65\x20\x79\x6F\x75\x20\x69\x6E\x20\x74\x68\x65\x20\x64\x65\x73\x65\x72\x74\x20\x74\x68\x65\x6E\x20\x74\x68\x65\x72\x65\x20\x69\x73\x20\x6E\x6F\x20\x6D\x6F\x72\x65\x20\x63\x6F\x6B\x65\x20\x6F\x6E\x20\x74\x68\x65\x20\x6D\x61\x72\x6B\x65\x74\x2C\x20\x72\x69\x67\x68\x74\x3F\x20\x53\x65\x65\x20\x68\x6F\x77\x20\x74\x68\x61\x74\x20\x77\x6F\x72\x6B\x73\x3F\x20\x54\x68\x65\x72\x65\x27\x73\x20\x6F\x6E\x6C\x79\x20\x75\x73\x2E\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0D\x0A\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3C\x64\x69\x76\x3E\x44\x6F\x20\x79\x6F\x75\x20\x72\x65\x61\x6C\x6C\x79\x20\x77\x61\x6E\x6E\x61\x20\x6C\x69\x76\x65\x20\x69\x6E\x20\x61\x20\x77\x6F\x72\x6C\x64\x20\x77\x69\x74\x68\x6F\x75\x74\x20\x43\x6F\x63\x61\x2D\x43\x6F\x6C\x61\x3F","\x72\x6F\x77","\x69\x6E\x66\x6F\x62\x6F\x78","\x6C\x6F\x72\x65","\x6C\x6F\x72\x65\x31","\x6C\x6F\x72\x65\x32","\x6C\x6F\x72\x65\x33","\x6C\x6F\x72\x65\x34","\x6C\x6F\x72\x65\x35"];addLayer(_0x61be[0],{row:_0x61be[1],color:_0x61be[2],textStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]},startData:function(){return {One: new Decimal(0),Two: new Decimal(0),Three: new Decimal(0),Four: new Decimal(0),Five: new Decimal(0),Six: new Decimal(0)}},layerShown:function(){if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[7][_0x61be[4]]()){return true};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[8][_0x61be[4]]()){return true};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[9][_0x61be[4]]()){return true};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[10][_0x61be[4]]()){return true};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[11][_0x61be[4]]()){return true};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[12][_0x61be[4]]()){return true}else {return false}},tooltip:function(){return _0x61be[13]},infoboxes:{lore:{unlocked:function(){if(player[_0x61be[0]][_0x61be[14]]== 1){return true}},title:_0x61be[15],body:function(){return _0x61be[16]},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}},lore1:{unlocked:function(){if(player[_0x61be[0]][_0x61be[17]]== 1){return true}},title:_0x61be[18],body:function(){return _0x61be[19]},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}},lore2:{unlocked:function(){if(player[_0x61be[0]][_0x61be[20]]== 1){return true}},title:_0x61be[21],body:function(){return _0x61be[22]},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}},lore3:{unlocked:function(){if(player[_0x61be[0]][_0x61be[23]]== 1){return true}},title:_0x61be[24],body:function(){return _0x61be[25]},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}},lore4:{unlocked:function(){if(player[_0x61be[0]][_0x61be[26]]== 1){return true}},title:_0x61be[27],body:function(){return _0x61be[28]},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}},lore5:{unlocked:function(){if(player[_0x61be[0]][_0x61be[29]]== 1){return true}},title:_0x61be[30],body:function(){return `${_0x61be[31]}`},titleStyle:{"\x63\x6F\x6C\x6F\x72":_0x61be[3]}}},update:function(){if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[7][_0x61be[4]]()){player[_0x61be[0]][_0x61be[14]]=  new Decimal(1)};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[8][_0x61be[4]]()){player[_0x61be[0]][_0x61be[17]]=  new Decimal(1)};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[9][_0x61be[4]]()){player[_0x61be[0]][_0x61be[20]]=  new Decimal(1)};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[10][_0x61be[4]]()){player[_0x61be[0]][_0x61be[23]]=  new Decimal(1)};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[11][_0x61be[4]]()){player[_0x61be[0]][_0x61be[26]]=  new Decimal(1)};if(player[_0x61be[6]][_0x61be[5]][_0x61be[4]]()== _0x61be[12][_0x61be[4]]()){player[_0x61be[0]][_0x61be[29]]=  new Decimal(1)}},tabFormat:[[_0x61be[32],[[_0x61be[33],_0x61be[34]],[_0x61be[33],_0x61be[35]],[_0x61be[33],_0x61be[36]],[_0x61be[33],_0x61be[37]],[_0x61be[33],_0x61be[38]],[_0x61be[33],_0x61be[39]]]]]})

addLayer("Per", {
    branches: ['p', 'He', 'Li', 'Be', 'B', 'C', 'N'],
    row: 1,
    position: 1,
    color: "#FFFFFF",
    tooltip() { return "" },

    infoboxes: {
        lore: {
            title: "Welcome To The Periodic Table Tree",
            body() { return "Here you will advance from element to element until I decide to stop. That's about it, not much else to say...There's save files under this if you want to skip a section or your savefile gets corrupted. (Mobile players, ya gotta swap over to the low qual mode. Just like, click on the gear thingy.)" },
        },
    },

    tabFormat: [
        ["infobox", "lore"],
        ["display-text",
            function () { return 'A fun little periodic table:' }],
        "blank",
        ["display-image",
            function () { return 'https://i.postimg.cc/59DXKHnn/6ce621c1-37d7-4aa1-8068-18a856d6c523.jpg' }],
        "blank",
        ["display-text",
            function () { return 'Save bank:' }],
            "blank",
        ["display-text",
            function () { return `<a href="https://github.com/BilboyX/The-Periodic-Table-Tree/tree/master/save-files" target="_blank" rel="noopener noreferrer">The Periodic Table Tree: Save Files</a>`}],
       "blank",
        ["display-text",
            function () { return 'Credits: <div> Escapee, <div> smiley, <div> Jakub, <div> g🆎ples2, <div> Acamaeda, <div> incremental_gamer, <div> P🆎tfr, <div> JJP.' }],
            ["display-image", 'https://i.postimg.cc/x1b6Q644/c8b42708505611e88f6702e6256ec5c3-1-removebg-preview.png', { 'height': `30px`, 'width': `30px`, position: 'relative', right: '-50px', top: '-148px'}],
            ["display-image", 'https://i.postimg.cc/brn1WwgV/Studio-Project-removebg-preview.png', { 'height': `30px`, 'width': `30px`, position: 'relative', right: '50px', top: '-168px'}],
            ["display-image", 'https://i.postimg.cc/mk54KTdq/a5219bd91f868f264f556082bbb339dd.jpg', { 'height': `25px`, 'width': `25px`, position: 'relative', right: '-50px', top: '-182px'}],
            ["display-image", 'https://i.postimg.cc/zGCzGb0S/15-2-removebg-preview-1.png', { 'height': `25px`, 'width': `25px`, position: 'relative', right: '52px', top: '-188px'}],
            ["display-image", 'https://i.postimg.cc/kGNV316K/Screenshot-2022-07-21-021115-removebg-preview.png', { 'height': `35px`, 'width': `30px`, position: 'relative', right: '-52px', top: '-205px'}],
            ["display-image", 'https://i.postimg.cc/PJ6jwY00/Screenshot-2022-07-21-021433-removebg-preview.png', { 'height': `30px`, 'width': `35px`, position: 'relative', right: '88px', top: '-220px'}],
            ["display-image", 'https://i.postimg.cc/26Sm80Kn/Screenshot-2022-07-21-021710-removebg-preview.png', { 'height': `30px`, 'width': `27px`, position: 'relative', right: '-50px', top: '-230px'}],
            ["display-image", 'https://i.postimg.cc/VL2zzBwV/Screenshot-2022-07-21-022358-removebg-preview.png', { 'height': `30px`, 'width': `30px`, position: 'relative', right: '46px', top: '-250px'}],
    ]
})

addLayer("A", {

    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            Expulrate: new Decimal(0.4),
            Expulrate2: new Decimal(1),
        }
    },

    color: "#ff0000",
    symbol: "A",
    row: "side",
    resource: "Achievements",

    achievements: {
        11: {
            name: "Your First Element!",
            tooltip: "NOOOOOOOOOOOOOOOOOOOOO WAAAAAAAAY!?!@@#@#",
            textStyle: { "color": "#000000"},
            done() { return player.E.points.gte(1) },
            image() { if (hasAchievement('A', 11)) return "https://i.postimg.cc/MpbZpCHf/232539b4-d9dd-4481-8b5c-8e70c11f3e52-prev-ui-1.png"},
            style: { "background-size": "100% 100%", 'background-opacity': 0.1},
        },
        12: {
            name: "Gassed Up",
            textStyle: { "color": "#000000" },
            tooltip: "Produce 10k Total Hydrogen Gas.",
            style: { "background-size": "100% 100%" },
            done() { return player.p.Gas.gte(10000) },
            image() { if (hasAchievement('A', 12)) return "https://i.postimg.cc/WbSTRMH0/183def70-5ee5-483d-acef-87bb808777cf-prev-ui-1.png" }
        },
        13: {
            name: `"Gotta Empty The Tank"`,
            textStyle: { "color": "#000000" },
            tooltip: "Hold over 1k Hydrogen Gas.",
            style: { "background-size": "100% 100%" },
            done() { return player.p.HydrogenGas.gte(1100) },
            image() { if (hasAchievement('A', 13)) return "https://i.postimg.cc/vHVpQ5T4/pixil-frame-0.png" }
        },
        14: {
            name: "Son of a GLITCH",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Decode with Base64 for answer: U3BhbSBjbGljayBvbiBob2xkIGJ1dHRvbiB3ZWlyZG8u",
            done() { return player.p.Clic.gte(101) },
            image() { if (hasAchievement('A', 14)) return "https://i.postimg.cc/0yddvF2j/527535f7-7dc4-43a5-b57a-a75afda3029b-1.png" }
        },
        15: {
            name: '"Shut Up B**ch"',
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            goalTooltip: "Spend over 201 ticks with extra text on.",
            doneTooltip: "Unlocks a button to shut off some text. Turns on others (;",
            done() { return player.p.GasTicks.gte(201) },
            image() { if (hasAchievement('A', 15)) return "https://i.postimg.cc/gkJ2mBys/84ae5647-37db-4c73-a6c3-7e50154d00bf-1.png" }
        },
        21: {
            name: "No Hydrogen?",
            textStyle: { "color": "#000000" },
            tooltip: "Get the second element.",
            style: { "background-size": "100% 100%" },
            done() { return player.E.points.gte(2) },
            image() { if (hasAchievement('A', 21)) return "https://i.postimg.cc/bvnrJyK1/f67ee54d-fa4f-4979-bc60-79070345f628-2.png" }
        },
        22: {
            name: `"Can't Empty The Tank"`,
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Break the current max capacity.",
            done() { return temp['p'].clickables[11].effect.gte(2801) },
            image() { if (hasAchievement('A', 22)) return "https://i.postimg.cc/768LD06g/b3a51e4b-c5b1-4013-9b4a-81a594eb3e3f.png" }
        },
        23: {
            name: `"The Perfect Concentration"`,
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Fill the bar 3 times without the multiplier dropping to 0.2.",
            done() { return player.p.HydroResets.gte(3) },
            image() { if (hasAchievement('A', 23)) return "https://i.postimg.cc/QtqT89Xy/da3cf436-9f42-4acb-bb08-3efd8abeaebe-2.png" }
        },
        24: {
            name: "NEET",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Fill up the bar around 5 times with a 1.1 Hydrogen Multiplier. Now go to the gym.",
            done() { if (hasUpgrade('p', 23)) return player.p.HydrogenPower.gte(5) },
            image() { if (hasAchievement('A', 24)) return "https://i.postimg.cc/nVQ3fmPh/cffd9b5d51642d58118de1a948cefd53-2934611896-prev-ui-1.png" }
        },
        25: {
            name: "Suffer",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "It's Always Been One Step Forward And Two Steps Back.",
            done() { if (hasUpgrade('p', 24)) return player.p.points.gte(55) },
            image() { if (hasAchievement('A', 25)) return "https://i.postimg.cc/KjgsnfHj/hqdefault-692744977-prev-ui-1.png" }
        },
        31: {
            name: "Avogadro's Constant",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Get 6.022e23. Nothing else is important. Nope.",
            done() { return player.p.HydrogenPower.gte(6.022e23) },
            image() { if (hasAchievement('A', 31)) return "https://i.postimg.cc/fRTxtNRL/1200px-Talpa-europaea-MHNT-on-transparent-background-2549044357-1-prev-ui-1.png" }
        },
        32: {
            name: "High-Pitched Frequency",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Click Deflate at 497L of Helium Gas or higher.",
            done() { if (player.He.State < 1) return player.He.Inflate.gte(497) },
            image() { if (hasAchievement('A', 32)) return "https://i.postimg.cc/C5BQT7Ng/slazzer-edit-image.png" }
        },
        33: {
            name: "SCROLL_WHEEL",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Tedious work eh?.",
            done() { if (hasUpgrade('He', 16)) return player.He.HeliumExpunged.gte(0.1) },
            image() { if (hasAchievement('A', 33)) return "https://i.postimg.cc/8zQ2NhvB/steel-magspeed-electromagnetic-scroll-wheel-theres-nothing-like-it-2264955822-prev-ui-2.png" }
        },
        34: {
            name: "Hydrogen Automaton",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Get full automation of Hydrogen layer.",
            done() { if (hasUpgrade('He', 22)) return player.He.HeliumExpunged.gte(0.1) },
            image() { if (hasAchievement('A', 34)) return "https://i.postimg.cc/0Q5pRHZM/cartoon-robot-free-2185919212-prev-ui.png" }
        },
        35: {
            name: "widepeepoHappy",
            textStyle: { "color": "#000000" },
            style: { "background-size": "110% 100%" },
            tooltip: ":widepeepoHappy:",
            done() { if (hasUpgrade('He', 25)) return player.He.HeliumExpunged.gte(0.1) },
            image() { if (hasAchievement('A', 35)) return "https://i.postimg.cc/MHwFn3gm/3bgrvhjkbkt21-1272574542-1-prev-ui.png" }
        },
        41: {
            name: "Ah sh*t, here we go again.",
            textStyle: { "color": "#000000" },
            style: { "background-size": "110% 100%" },
            tooltip: "Unlock the third element.",
            done() { return player.E.points.gte(3) },
            image() { if (hasAchievement('A', 41)) return "https://i.postimg.cc/sX1Q8NCD/2yxpv8.png" }
        },
        42: {
            name: "Thacker Pass lithium mine.",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Money talks.",
            done() { return player.Li.resets.gte(12) },
            image() { if (hasAchievement('A', 42)) return "https://i.postimg.cc/tgh9tQFc/slazzer-edit-image-3.png" }
        },
        43: {
            name: "Mining waste into the ocean.",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Surf surf, surf surf crazy.",
            done() { return player.Li.Runlock.gte(1) },
            image() { if (hasAchievement('A', 43)) return "https://i.postimg.cc/RZ7YgMbw/sewage-in-Bangkok-prev-ui.png" }
        },
        44: {
            name: "Restpritory damage.",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Black lung.",
            done() { return player.Li.Runlock.gte(2) },
            image() { if (hasAchievement('A', 44)) return "https://i.postimg.cc/pdnJskd4/black-lung-lawsuit-1024x675-prev-ui.png" }
        },
        45: {
            name: "Doctor Who???",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "Maybe you'll fix your past mistakes.",
            done() { return player.Li.Runlock.gte(2) },
            image() { if (hasAchievement('A', 45)) return "https://i.postimg.cc/vmcbkxRp/slazzer-edit-image.png" }
        },
        51: {
            unlocked() { if (hasAchievement('A', 45)) return true},
            name: "Goodbye Small Businesses",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "You increase your yearly income.",
            done() { return hasChallenge('Li', 11)},
            image() { if (hasAchievement('A', 51)) return "https://i.postimg.cc/vBVqKnfr/slazzer-edit-image.png" }
        },
        52: {
            unlocked() { if (hasAchievement('A', 52)) return true},
            name: "Goodbye Safety Goggles",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "You increase your yearly income.",
            done() { return hasChallenge('Li', 12)},
            image() { if (hasAchievement('A', 52)) return "https://i.postimg.cc/sDkNpwWV/brokenglasses1-prev-ui.png" }
        },
        53: {
            unlocked() { if (hasAchievement('A', 53)) return true},
            name: "Goodbye Safety Nets",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "You increase your yearly income.",
            done() { return hasChallenge('Li', 13)},
            image() { if (hasAchievement('A', 53)) return "https://i.postimg.cc/mDZXLrcq/main-qimg-02df11ec0c5652239094af55ebaff030-c-prev-ui.png" }
        },
        54: {
            unlocked() { if (hasAchievement('A', 54)) return true},
            name: "Goodbye Fair Prices",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "You increase your yearly income.",
            done() { return hasChallenge('Li', 14)},
            image() { if (hasAchievement('A', 54)) return "https://i.postimg.cc/DwyP4NfJ/slazzer-edit-image-1.png" }
        },
        55: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "Become A Monster",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%" },
            tooltip: "You've made life hell for others.",
            done() { return hasChallenge('Li', 15)},
            image() { if (hasAchievement('A', 55)) return "https://i.postimg.cc/SN0ys0rd/th-1543333648.jpg" }
        },
        61: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "They're Onto You",
            textStyle: { "color": "#000000" },
            style: { "background-size": "120% 120%" },
            tooltip: "Obtain the fourth element.",
            done() { return player.E.points.gte(4)},
            image() { if (hasAchievement('A', 61)) return "https://i.postimg.cc/k409TvTS/paranoia-removebg-preview.png" }
        },
        62: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "Time Is Of The Essence",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Get three engine nozzles.",
            done() { return getBuyableAmount('Be', 12) == 3},
            image() { if (hasAchievement('A', 62)) return "https://i.postimg.cc/T33wLQF2/slazzer-edit-image.png" }
        },
        63: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "Half The Riddle, Half The Time",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Get through 50% of the riddle.",
            done() { return hasUpgrade('Be', 14)},
            image() { if (hasAchievement('A', 63)) return "https://i.postimg.cc/14xGR2Jz/slazzer-edit-image-1.png" }
        },
        64: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "They're At Your Door",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 40 total Beryllium Plates.",
            done() { return getBuyableAmount('Be', 11) == 40},
            image() { if (hasAchievement('A', 64)) return "https://i.postimg.cc/1tt2DVPq/slazzer-edit-image-2.png" }
        },
        65: {
            unlocked() { if (hasAchievement('A', 55)) return true},
            name: "Wait, That's A C-",
            textStyle: { "color": "#000000" },
            style: { "background-size": "140% 100%"},
            tooltip: `Build a "rocketship."`,
            done() { return hasMilestone('Be', 2)},
            image() { if (hasAchievement('A', 65)) return "https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png" }
        },
        71: {
            unlocked() { if (hasAchievement('A', 65)) return true},
            name: "Fly Me To The Moon",
            textStyle: { "color": "#000000" },
            style: { "background-size": "120% 100%", "background-position": "center center"},
            tooltip: "Get 100 Molten Liquid Iron",
            done() { return player.Be.moltenIron.gte(100)},
            image() { if (hasAchievement('A', 71)) return "https://i.postimg.cc/W16mJYFy/moon-16mar2014-stretched-prev-ui.png" }
        },
        72: {
            unlocked() { if (hasAchievement('A', 65)) return true},
            name: "Colonization Is Complicated",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 3 Rocketships",
            done() { return player.Be.Rocketships.gte(3)},
            image() { if (hasAchievement('A', 72)) return "https://i.postimg.cc/W4SLnJ17/Venus-imaged-by-Magellan-prev-ui.png" }
        },
        73: {
            unlocked() { if (hasAchievement('A', 65)) return true},
            name: "I Own The Galaxy",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Get 1g of Plutonium",
            done() { return player.Be.plutonium.gte(1)},
            image() { if (hasAchievement('A', 73)) return "https://i.postimg.cc/HxxySMH4/207-pluto-large-1-prev-ui.png" }
        },
        74: {
            unlocked() { if (hasAchievement('A', 65)) return true},
            name: "This Is Literal Cancer",
            textStyle: { "color": "#000000" },
            style: { "background-size": "160% 100%", "background-position": "center center"},
            tooltip: "Get 10 Rocketships",
            done() { return player.Be.Rocketships.gte(10)},
            image() { if (hasAchievement('A', 74)) return "https://i.postimg.cc/dtdxBKpW/D-prev-ui.png" }
        },
        75: {
            unlocked() { if (hasAchievement('A', 65)) return true},
            name: "Rainbow's Are Forever",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Get 1 Rainbownium",
            done() { return player.Be.rainbownium.gte(1)},
            image() { if (hasAchievement('A', 75)) return "https://i.postimg.cc/027nxkHK/bl881-removebg-preview.png" }
        },
        81: {
            unlocked() { if (hasAchievement('A', 75)) return true},
            name: "You Load Sixteen Tons",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 5 elements",
            done() { return player.E.points.gte(5)},
            image() { if (hasAchievement('A', 81)) return 'https://i.postimg.cc/VsXgqxT1/broken-pick-removebg-preview.png'}
        },
        82: {
            unlocked() { if (hasAchievement('A', 75)) return true},
            name: "And What Do You Get?",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 3 Prisms",
            done() { return player.B.points.gte(3)},
            image() { if (hasAchievement('A', 82)) return "https://i.postimg.cc/h4MzRMQT/prism-removebg-preview.png" }
        },
        83: {
            unlocked() { if (hasAchievement('A', 75)) return true},
            name: "Another Day Older and You're Deeper In Debt",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 7 Boron Resets",
            done() { return player.B.resets.gte(7)},
            image() { if (hasAchievement('A', 83)) return "https://i.postimg.cc/26zC4rq1/Furnace-transformed.jpg" }
        },
        84: {
            unlocked() { if (hasAchievement('A', 75)) return true},
            name: "Saint Peter Don't You Call Me 'Cause I Can't Go",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Have 2 Electric Diamond Hand Saw Parts",
            done() { return player.B.DS.gte(2)},
            image() { if (hasAchievement('A', 84)) return "https://i.postimg.cc/9X4MsVV5/Screenshot-2022-07-11-201935-removebg-preview-1.png" }
        },
        85: {
            unlocked() { if (hasAchievement('A', 75)) return true},
            name: "I Owe My Soul To The Company Store",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%"},
            tooltip: "Unlock The Workshop",
            done() { return player.B.DS.gte(3)},
            image() { if (hasAchievement('A', 85)) return "https://i.postimg.cc/YSnryDsC/2017-05-09-001-2017-05-09-007-removebg-preview.png" }
        },
        91: {
            unlocked() { if (hasAchievement('A', 85)) return true},
            name: "Literally Grinding",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Have three Boron upgrades",
            done() { return hasUpgrade('B', 11) && hasUpgrade('B', 12) && hasUpgrade('B', 13)},
            image() { if (hasAchievement('A', 91)) return "https://i.postimg.cc/pTh4CyX2/Screenshot-2022-07-13-002811-removebg-preview.png" }
        },
        92: {
            unlocked() { if (hasAchievement('A', 85)) return true},
            name: "Something's Brewing",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Get Boron Automation",
            done() { return hasUpgrade('B', 21)},
            image() { if (hasAchievement('A', 92)) return "https://i.postimg.cc/CL9nfCY1/th-2214508969-removebg-preview.png" }
        },
        93: {
            unlocked() { if (hasAchievement('A', 85)) return true},
            name: "Nuclear Magnetic Resonance",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Have 1e9 Boron",
            done() { return player.B.Boron.gte(1e9)},
            image() { if (hasAchievement('A', 93)) return "https://i.postimg.cc/j2P03rWB/avanceiii-hd-nanobay-orig-removebg-preview.png" }
        },
        94: {
            unlocked() { if (hasAchievement('A', 85)) return true},
            name: "No, This Is Not Vorona",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: `Have upgrade "CVD"`,
            done() { return hasUpgrade('B', 24)},
            image() { if (hasAchievement('A', 94)) return "https://i.postimg.cc/GhT19Gqq/istockphoto-1213521027-170667a-removebg-preview.png" }
        },
        95: {
            unlocked() { if (hasAchievement('A', 85)) return true},
            name: "Astroid Destroyer",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Destroy the final meteorite",
            done() { return player.B.Slider == 10 && player.B.Ticks.lt(1)},
            image() { if (hasAchievement('A', 95)) return "https://i.postimg.cc/wB8x90zX/Two-asteroids-colliding-1022945-removebg-preview.png" }
        },
        101: {
            unlocked() { if (hasAchievement('A', 95)) return true},
            name: "The Rat Race",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "The sixth element must be yours",
            done() { return player.C.points.gte(1)},
            onComplete() { return player.E.points = player.E.points.add(1)},
            image() { if (hasAchievement('A', 101)) return "https://i.postimg.cc/mrrmccCF/Rat2-Rat-removebg-preview.png" }
        },
        102: {
            unlocked() { if (hasAchievement('A', 95)) return true},
            name: "Carbon Copied",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Please play Progress Knight. It's way better than this layer.",
            done() { return player.C.Levelptm >= 10},
            image() { if (hasAchievement('A', 102)) return "https://i.postimg.cc/G3z9KHyp/Screenshot-2022-07-21-144251-removebg-preview.png" }
        },
        103: {
            unlocked() { if (hasAchievement('A', 95)) return true},
            name: "Rolling In The Dough",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Get CEO Level 2",
            done() { return player.C.LevelC >= 2},
            image() { if (hasAchievement('A', 103)) return "https://i.postimg.cc/cLGq8cLt/money-falling-png-7.png" }
        },
        104: {
            unlocked() { if (hasAchievement('A', 95)) return true},
            name: "Petty Theft or Grand Theft Carbon?",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Get Pickpocket Level 10",
            done() { return player.C.Levelp >= 10},
            image() { if (hasAchievement('A', 104)) return "https://i.postimg.cc/nz9bDSB7/woman-stealing-money-pocket-her-lover-back-59070609-removebg-preview.png" }
        },
        105: {
            unlocked() { if (hasAchievement('A', 95)) return true},
            name: "Getting Old...",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Work for 20 Years",
            done() { return player.C.Year >= 20},
            image() { if (hasAchievement('A', 105)) return "https://i.postimg.cc/8cF5sbPn/worker-4395768-1920-1024x683-removebg-preview.png" }
        },
        111: {
            unlocked() { if (hasAchievement('A', 105)) return true},
            name: "Rejuvenated",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 130%", "background-position": "center center"},
            tooltip: "Reset Carbon Layer",
            done() { return player.C.Res >= 1},
            image() { if (hasAchievement('A', 111)) return "https://i.postimg.cc/rFjVcbJF/Fountain-006-scaled-e1590005999477-removebg-preview.png" }
        },
        112: {
            unlocked() { if (hasAchievement('A', 105)) return true},
            name: "Black Lung Again?",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Get Full-time Miner Level 50",
            done() { return player.C.Levelftm >= 50},
            image() { if (hasAchievement('A', 112)) return "https://i.postimg.cc/Jnz36SPD/black-lung-lawsuit-1024x675-prev-ui-removebg-preview.png" }
        },
        113: {
            unlocked() { if (hasAchievement('A', 105)) return true},
            name: "I Own You",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: "Get CEO Level 10",
            done() { return player.C.LevelC >= 10},
            image() { if (hasAchievement('A', 113)) return "https://i.postimg.cc/L5fVLLxN/low-key-portrait-of-menacing-looking-picture-k5601974-removebg-preview.png" }
        },
        114: {
            unlocked() { if (hasAchievement('A', 105)) return true},
            name: "Master C- Thief",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Get Jewelry Store Level 11",
            done() { return player.C.LevelJ >= 11},
            image() { if (hasAchievement('A', 114)) return "https://i.postimg.cc/VkSkRgqf/image15-3-removebg-preview.png" }
        },
        115: {
            unlocked() { if (hasAchievement('A', 105)) return true},
            name: "The Rich Made Obedient",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Do what they are asking for.",
            done() { return player.C.Levelptm >= 100 && player.C.Levelftm >= 100 && player.C.LevelM >= 100 && player.C.LevelE >= 100 && player.C.LevelC >= 100 && player.C.Levelp >= 100 && player.C.LevelG >= 100 && player.C.LevelJ >= 100 && player.C.LevelB >= 100 && player.C.Levelf >= 100 && player.C.LevelJB >= 100 && player.C.Levelpe >= 100 && player.C.LevelR >= 100 && player.C.LevelD >= 100 && player.C.Levelt >= 100 && player.C.LevelW >= 100},
            image() { if (hasAchievement('A', 115)) return "https://i.postimg.cc/K8ygRdSX/ce06b00e5f5b305c46d85ad0727b5ada-amc-breaking-bad-crawl-spaces-removebg-preview-modified-2.png" }
        },
        121: {
            unlocked() { if (hasAchievement('A', 115)) return true},
            name: "Lucky Number Nitrogen?",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "The 7th Element rests in your hands.",
            done() { return player.E.points.gte(7)},
            image() { if (hasAchievement('A', 121)) return "https://i.postimg.cc/T274TNjV/nitrogen-prev-ui.png" }
        },
        122: {
            unlocked() { if (hasAchievement('A', 115)) return true},
            name: "Nitrogen Chemical Reactions",
            textStyle: { "color": "#000000" },
            style: { "background-size": "150% 100%", "background-position": "center center"},
            tooltip: `Get Upgrade, "Rapid Decompression"`,
            done() { return hasUpgrade('N', 12)},
            image() { if (hasAchievement('A', 122)) return "https://i.postimg.cc/hj31R6Fh/maxresdefault-4-prev-ui.png" }
        },
        123: {
            unlocked() { if (hasAchievement('A', 115)) return true},
            name: "Nitrogen Expansion",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: `Get Upgrade, "Organic Matter"`,
            done() { return hasUpgrade('N', 14)},
            image() { if (hasAchievement('A', 123)) return "https://i.postimg.cc/KzKJjxDt/Liquid-Nitrogen-Explosion-finale-prev-ui.png" }
        },
        124: {
            unlocked() { if (hasAchievement('A', 115)) return true},
            name: "Nitrogen Decay",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: `Get Upgrade, "Thermal Decomposition"`,
            done() { return hasUpgrade('N', 15)},
            image() { if (hasAchievement('A', 124)) return "https://i.postimg.cc/qvJfR6hn/farmer-spreading-fertilizer-by-hand-prev-ui.png" }
        },
        125: {
            unlocked() { if (hasAchievement('A', 115)) return true},
            name: "Nitrogen Nimbility",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Get the Golden Trophy.",
            done() { return hasMilestone('N', 8)},
            image() { if (hasAchievement('A', 125)) return "https://i.postimg.cc/pX0CfmcK/maxresdefault-5-prev-ui.png" }
        },
        131: {
            unlocked() { if (hasAchievement('A', 125)) return true},
            name: "What Is Going On?",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Fail once.",
            done() { return player.N.failed.gte(1)},
            image() { if (hasAchievement('A', 131)) return "https://i.postimg.cc/QC1ftwNZ/ops-meme-nba-1024x768-removebg-preview.png" }
        },
        132: {
            unlocked() { if (hasAchievement('A', 125)) return true},
            name: "This Is How I Quit Huh.",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Fail Twice.",
            done() { return player.N.failed.gte(2)},
            image() { if (hasAchievement('A', 132)) return "https://i.postimg.cc/vZNZYN4m/vSP4p.png" }
        },
        133: {
            unlocked() { if (hasAchievement('A', 125)) return true},
            name: "My Stress Is Relieved",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Play the battery minigame.",
            done() { return tmp.N.start.gte(1)},
            image() { if (hasAchievement('A', 133)) return "https://i.postimg.cc/RFctnBtd/IcCiXa.png" }
        },
        134: {
            unlocked() { if (hasAchievement('A', 125)) return true},
            name: "I'm Actually Making Progress",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Get a combo of 5",
            done() { return hasMilestone('N', 10)},
            image() { if (hasAchievement('A', 134)) return "https://i.postimg.cc/TYPyTmtC/adult-analysis-analyzing-assistant-8326782-3839380468-removebg-preview.png" }
        },
        135: {
            unlocked() { if (hasAchievement('A', 125)) return true},
            name: "I'm The Goat",
            textStyle: { "color": "#000000" },
            style: { "background-size": "100% 100%", "background-position": "center center"},
            tooltip: "Get a combo of 50",
            done() { return hasMilestone('N', 12)},
            image() { if (hasAchievement('A', 135)) return "https://i.postimg.cc/d3hjkXqV/Screenshot-2022-07-30-212349-removebg-preview-2.png" }
        },
    },

    clickables: {
        11: {
            title: "Get Achievement 4",
            display() {
                return "If you can't get it normally anymore or don't understand how to get it."
            },
            style: { "background-color": "#0000ff" },
            canClick() {
                return true
            },
            style: { "color": "#ededed" },
            onClick() { return player.p.Clic = player.p.Clic.add(101) },
        },
    },

    tabFormat: [
        ["display-text",
            function () {
                if (player.p.Node < 1) return 'You have ' + formatWhole(player.A.points) + ' achievements'
                else return 'Heisenburg'
            }],
        "blank",
        "achievements",
        "clickables",
    ],

    update() {
        if (player.He.HeliumExpunged > 1 && hasUpgrade('He', 21) == false && hasMilestone('Li', 1) == false) player.He.HeliumExpunged = player.He.HeliumExpunged.add(-player.A.Expulrate)
        if (player.He.HeliumExpunged < 0.1 && hasUpgrade('He', 21) == false && hasMilestone('Li', 1) == false) player.He.HeliumExpunged = player.He.HeliumExpunged.add(player.A.Expulrate2)
        player.p.HydroGain = player.p.HydroGain.times(0),
        player.A.points = new Decimal(player.A.achievements.length)
        if (player.p.HydrogenMult < 0.2) player.p.HydroResets = player.p.HydroResets.times(0)
    }
})

addLayer("p", {

    symbol() { return options.toggleButtonAnimations ? '' : 'H' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#0000ff',
            'background-image': 'url("resources/Hydrogen.gif")',
            'background-position': 'center bottom',
            'background-size': '95%',
            'border': '1px solid #0000ff'
        } : {}
    },
    name: "Hydrogen", // This is optional, only used in a few places, If absent it just uses the layer id.
    image: "https://i.postimg.cc/sxTpYZ07/a1f4826e-e1d2-40a3-8027-e243e33ca67b-Photo-Room-1.png", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            HydrogenGas: new Decimal(0),
            HydrogenPower: new Decimal(0),
            HydrogenMult: new Decimal(0),
            Gas: new Decimal(0),
            GasTicks: new Decimal(0),
            HydroGain: new Decimal(0),
            Node: new Decimal(0),
            Clic: new Decimal(0),
            HydroResets: new Decimal(0),
            effect2: new Decimal(1),
          
            
        }
    },

            effect3: new Decimal(2),
            effect4: new Decimal(1),
            effect5: new Decimal(2),
            effect6: new Decimal(1),
            effectM: new Decimal(0.2),
            effectMult: new Decimal(0),
            effectD: new Decimal(5),
            lightfall: new Decimal(-0.1),
            Equa: new Decimal(0),
            cap: new Decimal(3),
    upgra: new Decimal(0),
    color: "#0000ff",
    requires() { return player.He.points.add(1).pow(2) }, // Can be a function that takes requirement increases into account
    resource: "Hydrogen", // Name of prestige currency
    baseResource: "Hydrogen Power", // Name of resource prestige is based on
    baseAmount() { return player.p.HydrogenPower }, // Get the current amount of baseResource
    requires: new Decimal(1),
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(0.8)
        tmp.p.upgra = new Decimal(player.p.upgrades.length)
        if (hasUpgrade('p', 16)) return exp.times(tmp.p.upgra.pow(-0.22))
        else return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "h", description: "H: Reset for Hydrogen", onPress() { if (canReset(this.layer)) doReset(this.layer)}, 
        unlocked() { if (hasUpgrade('He', 11)) return false
        else return true}},
    ],

    layerShown() { return true },

    onPrestige() {
        if (hasUpgrade('He', 22)) return ""
        player.p.HydrogenPower = player.p.HydrogenPower.times(0)
    },

    autoPrestige() { if (hasUpgrade('He', 11)) return true },

    canBuyMax() { return (hasMilestone('p', 3)) },

    tooltip() { return formatWhole(player.p.points) + " Hydrogen and " + formatWhole(player.p.HydrogenPower) + " Hydrogen Power" },

    bars: {
        HydrogenBar: {
            direction: UP,
            width: 200,
            height() {
                if (hasUpgrade('p', 16)) return 600
                else return 400
            },
            progress() {
                let prog1 = 499.99
                if (hasMilestone('p', 2)) prog1 = 999.99
                if (hasUpgrade('p', 16)) prog1 = 1999.99
                if (hasMilestone('He', 3)) prog1 = 19999.99
                if (hasUpgrade('p', 22)) prog1 = 19999999999.99
                if (hasUpgrade('p', 23)) prog1 = 7999999.99
                if (hasUpgrade('p', 25)) prog1 = 19999.99
                if (hasUpgrade('He', 22)) return 1
                return player.p.HydrogenGas / prog1
            },
            display() { return "Hydrogen Tank" },
            fillStyle: { "background-color": "#0000ff" }
        },

        HydrogenBar1: {
            direction: UP,
            width: 200,
            height() {
                if (hasUpgrade('p', 16)) return 600
                else return 400
            },
            progress() {
                let P2 = new Decimal(0)
                let prog2 = 999.99
                if (hasUpgrade('p', 16)) prog2 = 1999.99
                if (hasMilestone('He', 3)) prog2 = 19999.99
                if (hasUpgrade('p', 22)) prog2 = 19999999999.99
                if (hasUpgrade('p', 23)) prog2 = 7999999.99
                if (hasUpgrade('p', 25)) prog2 = 19999.99
                if (hasUpgrade('He', 22)) return 1
                if (player.p.HydrogenGas > prog2) P2 = player.p.HydrogenGas.add(-prog2) / prog2
                return P2
            },
            display() { return "Hydrogen Tank" },
            fillStyle: { "background-color": "#0000ff" },
            unlocked() {
                if (hasUpgrade('p', 14)) return true
                else return false
            }
        },

        HydrogenBar2: {
            direction: UP,
            width: 200,
            height() {
                if (hasUpgrade('p', 16)) return 600
                else return 400
            },
            progress() {
                let prog3 = 3
                if (hasUpgrade('p', 23)) prog3 = 1.11
                if (hasUpgrade('p', 24)) prog3 = 10
                return player.p.HydrogenMult / prog3
            },
            display() { return "Hydrogen Multiplier Tank <div> Currently: " + format(player.p.HydrogenMult) + "x" },
            fillStyle: { "background-color": "#ff0000" },
            unlocked() {
                if (hasMilestone('He', 3)) return true
                else return false
            }
        }
    },

    milestones: {
        1: {
            style: { "color": "#ededed" },
            requirementDescription: "1 Hydrogen",
            effectDescription: "2x Hydogen Gas.",
            done() { return player.p.points.gte(1) },
            onComplete() { player.E.points = player.E.points.add(1) },
        },
        2: {
            style: { "color": "#ededed" },
            requirementDescription: "2 Hydrogen",
            effectDescription: "2x Hydrogen Tank Capacity. Also unlock upgrades.",
            done() { return player.p.points.gte(2) },
            unlocked() {
                if (hasMilestone('p', 1)) return true
            },
        },
        3: {
            style: { "color": "#ededed" },
            requirementDescription: "3 Hydrogen",
            effectDescription: "Buy max Hydrogen.",
            done() { return player.p.points.gte(3) },
            unlocked() {
                if (hasMilestone('p', 2)) return true
            },
        },
        4: {
            style: { "color": "#ededed" },
            requirementDescription: "20 Hydrogen",
            effectDescription: "Hydrogen Gas boosts Hydrogen Gas. (Must have 6 Hydrogen Upgrades.)",
            done() { if (hasUpgrade('p', 16)) return player.p.points.gte(20) },
            unlocked() {
                if (hasMilestone('p', 3)) return true
            },
        },
    },

    upgrades: {
        11: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Gassed Up",
            description: "Hydrogen Gas gain is raised to the power of 2.",
            cost() {
                if (hasUpgrade('p', 12)) return new Decimal(3)
                else return new Decimal(2)
            },
            unlocked() {
                if (hasMilestone('p', 2)) return true
                else return false
            },
        },
        12: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Based",
            description: "Add 1 to the Hydrogen Gas base",
            cost() {
                if (hasUpgrade('p', 11)) return new Decimal(3)
                else return new Decimal(2)
            },
            unlocked() {
                if (hasMilestone('p', 2)) return true
                else return false
            },
        },
        13: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Bonding",
            description: "Add 2 more to the base of Hydrogen Gas.",
            cost: new Decimal(8),
            unlocked() {
                if (hasUpgrade('p', 11)) return true
                if (hasUpgrade('p', 12)) return true
                else return false
            },
        },
        14: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Expanding",
            description: "Get a 2nd Hydrogen tank. Keep cost.",
            cost: new Decimal(16),
            onPurchase() { return player.p.points = player.p.points.add(16) },
            unlocked() {
                if (hasUpgrade('p', 13)) return true
                else return false
            },
        },
        15: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Powering Up",
            description: "Hydrogen Power boosts Hydrogen Gas.",
            effectDisplay() { return "+" + format(tmp.p.effect2) },
            cost: new Decimal(18),
            unlocked() {
                if (hasUpgrade('p', 14)) return true
                else return false
            },
        },
        16: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Half Lifed",
            description: "Hydrogen upgrades on this row cut Hydrogen cost, but Hydrogen Tank capcity is doubled.",
            cost: new Decimal(20),
            effectDisplay() { return "/" + format(tmp.p.upgra.pow(-0.22)) },
            unlocked() {
                if (hasUpgrade('p', 15)) return true
                else return false
            },
        },
        21: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Hilarity",
            description: "Unlock Helium. Keep cost.",
            cost: new Decimal(100),
            onPurchase() { return player.p.points = player.p.points.add(100) },
            unlocked() {
                if (hasUpgrade('p', 16)) return true
                else return false
            },
        },
        22: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Lightness",
            description: "Hydrogen Multiplier falls slower but increase tank capacity by 1 million times. Lose all your Helium",
            cost: new Decimal(400),
            onPurchase() { return player.p.points = player.p.points.times(0), player.p.HydrogenPower = player.p.HydrogenPower.times(0), player.p.HydrogenGas = player.p.HydrogenGas.times(0) },
            unlocked() {
                if (hasUpgrade('He', 13)) return true
                else return false
            },
        },
        23: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Embrittled",
            description: "Hydrogen Tank capacity is much lower but so is the Hydrogen Multiplier cap.",
            cost: new Decimal(12),
            onPurchase() { return player.p.HydrogenMult = player.p.HydrogenMult.times(0.1), player.p.HydrogenPower = player.p.HydrogenPower.times(0) },
            unlocked() {
                if (hasUpgrade('p', 22)) return true
                else return false
            },
        },
        24: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Enthalpy Of Combustion",
            description: "Increase Hydrogen Multiplier cap but Hydrogen Gas gain is divided on an exponent of how large the multiplier is. The middle has a sweet spot.",
            cost: new Decimal(10),
            onPurchase() { return player.p.HydrogenMult = player.p.HydrogenMult.times(0.1), player.p.HydrogenPower = player.p.HydrogenPower.times(0) },
            unlocked() {
                if (hasUpgrade('p', 23)) return true
                else return false
            },
        },
        25: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Detonation",
            description: "Helium hardcap is removed. Hydrogen Tank cap is decreased.",
            cost: new Decimal(15),
            onPurchase() { return player.p.HydrogenMult = player.p.HydrogenMult.times(0.1), player.p.HydrogenPower = player.p.HydrogenPower.times(0) },
            unlocked() {
                if (hasUpgrade('p', 24)) return true
                else return false
            },
        },
        26: {
            style: { "color": "#ededed" },
            title: "Hydrogen's Tritium",
            description: "Unlock balloons. Remove Hydrogen Multiplier Division. The Multiplier also boosts Hydrogen Power. Hydrogen Multiplier falls much slower.",
            cost: new Decimal(1600),
            unlocked() {
                if (hasUpgrade('p', 25)) return true
                else return false
            },
        }
    },


    clickables: {
        11: {
            title: "Hydrogen Gas",
            display() {
                if(options.mobileMode == true) return "Produce Hydrogen Gas on hold"
                if(options.mobileMode == false) return "Produce Hydrogen Gas on hover. IF YOU'RE ON MOBILE, SWITCH TO LOW QUALITY MODE IN SETTINGS."
            },
            style: { "background-color": "#0000ff" },
            canClick() {
                return true
            },
            style: { "color": "#ededed" },
            effect() {
                let effect = new Decimal(0.9)
                tmp.p.effect2 = new Decimal(1)
                tmp.p.effect3 = new Decimal(2)
                tmp.p.effect4 = new Decimal(1)
                tmp.p.effect5 = new Decimal(2)
                tmp.p.effect6 = new Decimal(1)
                let effectMult2 = new Decimal(1)
                let prog = 499.99
                if (player.Li.resets > 0) tmp.p.effect5 = 4, tmp.p.effect6 = 2
                if (hasUpgrade('p', 26)) effectMult2 = effectMult2.add(player.p.HydrogenMult)
                if (hasMilestone('He', 5)) tmp.p.effect4 = 0
                if (hasUpgrade('He', 13)) tmp.p.effect3 = 1
                if (hasUpgrade('p', 25)) tmp.p.effect4 = 1
                if (hasUpgrade('p', 25)) tmp.p.effect3 = 2
                if (hasUpgrade('p', 12)) effect = effect.add(1)
                if (hasUpgrade('p', 13)) effect = effect.add(2)
                if (hasMilestone('p', 2)) prog = 999.99
                if (hasUpgrade('p', 14)) prog = 1999.99
                if (hasUpgrade('p', 16)) prog = 3999.99
                if (hasMilestone('He', 3)) prog = 39999.99
                if (hasUpgrade('p', 22)) prog = 39999999999.99
                if (hasUpgrade('p', 23)) prog = 16340999.99
                if (hasUpgrade('p', 25)) prog = 39999.99
                if (hasMilestone('p', 1)) effect = effect.times(2)
                if (hasUpgrade('p', 11)) effect = effect.pow(2)
                if (hasUpgrade('p', 15)) tmp.p.effect2 = tmp.p.effect2.add(player.p.HydrogenPower.pow(0.8))
                if (tmp.p.effect2 > 99.99) tmp.p.effect2 = 100
                if (hasUpgrade('p', 15)) effect = effect.add(tmp.p.effect2)
                if (hasMilestone('p', 4)) effect = effect.add(effect.times(player.p.points.add(1).pow(0.2)))
                effect = effect.times(player.He.points.pow(tmp.p.effect3).times(tmp.p.effect4).add(1))
                if (player.p.HydrogenGas > prog) player.p.HydroResets = player.p.HydroResets.add(1), player.p.HydrogenPower = player.p.HydrogenPower.times(effectMult2).add(1).add(player.p.points.add(player.p.points).times(player.He.points.add(1).pow(tmp.p.effect3).times(tmp.p.effect4).times(player.Li.points.add(new Decimal(1)).pow(tmp.p.effect5).times(tmp.p.effect6)))), player.p.HydrogenGas = player.p.HydrogenGas.times(0)
                return effect
            },
            unlocked() {
                if (hasUpgrade('He', 12)) return false
                else return true
            },
            onClick() {
                if (hasUpgrade('p', 14)) player.p.Clic = player.p.Clic.add(1)
            },
            onHover() {
                if(options.mobileMode == false){
                    player.p.GasTicks = player.p.GasTicks.add(1)
                if (player.p.Node < 1) player.p.HydroGain = player.p.HydroGain.add(1)
                player.p.HydrogenGas = player.p.HydrogenGas.add((temp['p'].clickables[11].effect).times(player.p.HydrogenMult.add(1)).times(player.Li.points.add(1).pow(tmp.p.effect5).times(tmp.p.effect6)))
                player.p.Gas = player.p.Gas.add(temp['p'].clickables[11].effect)}
            },
            onHold() {
                if(options.mobileMode == true){
                player.p.GasTicks = player.p.GasTicks.add(1)
                if (player.p.Node < 1) player.p.HydroGain = player.p.HydroGain.add(1)
                player.p.HydrogenGas = player.p.HydrogenGas.add((temp['p'].clickables[11].effect).times(player.p.HydrogenMult.add(1)).times(player.Li.points.add(1).pow(tmp.p.effect5).times(tmp.p.effect6)))
                player.p.Gas = player.p.Gas.add(temp['p'].clickables[11].effect)}
            },
        },
        12: {
            title: "Hydrogen Multiplier",
            display() {
                if(options.mobileMode == true) return "Multiply Hydrogen Gas gain on hold."
                if(options.mobileMode == false) return "Multiply Hydrogen Gas gain on hover."
            },
            style: { "color": "#ededed" },
            unlocked() {
                if (hasMilestone('He', 3) && hasUpgrade('He', 22) == false) return true
                else return false
            },
            canClick() {
                return true
            },
            effect() {
                tmp.p.effectM = new Decimal(0.2)
                tmp.p.effectMult = new Decimal(0)
                tmp.p.effectMult = tmp.p.effectMult.add(player.p.HydrogenMult.add(1))
                tmp.p.effectD = new Decimal(5)
                tmp.p.lightfall = new Decimal(-0.1)
                tmp.p.Equa = new Decimal(0)
                tmp.p.cap = new Decimal(3)
                if (hasUpgrade('p', 24)) tmp.p.effectD = tmp.p.effectMult
                if (hasUpgrade('p', 26)) tmp.p.effectD = 5
                if (tmp.p.effectD > 5) tmp.p.effectMult = new Decimal(0.1).div(tmp.p.effectMult)
                if (tmp.p.effectD < 4) tmp.p.effectMult = new Decimal(0.1).div(tmp.p.effectMult)
                if (hasUpgrade('p', 23)) tmp.p.cap = 1.11
                if (hasUpgrade('p', 24)) tmp.p.cap = 10
                if (hasUpgrade('p', 22)) tmp.p.lightfall = -0.05
                if (hasUpgrade('p', 26)) tmp.p.lightfall = -0.005
                if (hasUpgrade('p', 24)) tmp.p.Equa = 2
                if (hasMilestone('He', 3)) tmp.p.Equa = 0.1
                if (hasMilestone('He', 4)) tmp.p.Equa = 0
                if (hasUpgrade('He', 16)) tmp.p.Equa = 0
                if (player.p.HydrogenMult > tmp.p.Equa) player.p.HydrogenMult = player.p.HydrogenMult.add(tmp.p.lightfall)
                if (player.p.HydrogenMult < tmp.p.Equa) player.p.HydrogenMult = player.p.HydrogenMult.add(-tmp.p.lightfall)
                return tmp.p.effectM
            },
            onHover(){
                if (options.mobileMode == false){
                player.p.HydrogenMult = player.p.HydrogenMult.add(temp['p'].clickables[12].effect)
                if (player.p.HydrogenMult > tmp.p.cap) player.p.HydrogenMult = player.p.HydrogenMult.add(tmp.p.effectM.times(-1))}
            },
            onHold() {
                if(options.mobileMode == true){
                player.p.HydrogenMult = player.p.HydrogenMult.add(temp['p'].clickables[12].effect)
                if (player.p.HydrogenMult > tmp.p.cap) player.p.HydrogenMult = player.p.HydrogenMult.add(tmp.p.effectM.times(-1))}
            }
        },
    },

    infoboxes: {
        lore: {
            titleStyle: { "color": "#ededed" },
            title: "Hydrogen",
            body() { return "This is a periodic table tree and it all starts with hydrogen because of its- well, I guess it's atomic properties or something. Anyway, start producing some hydrogen gas so we can convert it into energy or something." },
        },
        lore1: { 
        titleStyle: { "color": "#ededed" },
        title: "Hydrogen",
        body() { return "This is a periodic table tree and it all starts with hydrogen because of its- well, it's atomic properties or something. Anyway, start producing some hydrogen gas so we can convert it into energy or shit, I don't know, you figure it out." },
    },
    },

    tabFormat: [
        () => (options.matureMode == true) ? ["infobox", "lore1"] : ["infobox", "lore"],
        ["display-text",
            function () { if (player.p.Node < 1) return 'Hydrogen increases Hydrogen Power gain by ' + formatWhole(player.p.points.add(player.p.points)) }],
        "blank",
        "main-display",
        () => (hasUpgrade('He', 11)) ? "" : "prestige-button",
        ["display-text",
            function () { if (player.p.Node < 1) return 'You have ' + formatWhole(player.p.HydrogenPower) + ' Hydrogen Power' }],
        "blank",
        "milestones",
        "blank",
        ["display-text",
            function () { if (player.p.Node < 1) return 'You have ' + format(player.p.HydrogenGas) + 'L Hydrogen Gas' }],
        ["display-text",
            function () { if (player.p.HydroGain > 0) return 'You are making ' + format(temp['p'].clickables[11].effect) + 'L Hydrogen Gas per tick' }],
        ["row", [//Hydro
            ["bar", "HydrogenBar"],
            "blank",
            ["bar", "HydrogenBar1"],
            "blank",
            "blank",
            ["bar", "HydrogenBar2"],
        ]],
        "blank",
        "clickables",
        "blank",
        "upgrades",
    ],

    doReset() {
        let keptMilestones = []
        let keptUpgrades = []
        if (player.He.resets > 0) keptMilestones.push(...player.p.milestones.slice(0, player.He.resets))
        if (player.He.resets > 1) keptUpgrades.push(...player.p.upgrades.slice(0, player.He.resets))
        layerDataReset(this.layer)
        player.p.upgrades.push(...keptUpgrades)
        player.p.milestones.push(...keptMilestones)
    },

    automate() {
        if (hasUpgrade('He', 22)) player.p.HydrogenMult = player.p.HydrogenMult.add(temp['p'].clickables[12].effect)
        if (hasUpgrade('He', 22) && player.p.HydrogenMult > tmp.p.cap) player.p.HydrogenMult = player.p.HydrogenMult.add(tmp.p.effectM.times(-1))
        if (hasUpgrade('He', 12)) player.p.GasTicks = player.p.GasTicks.add(1),
            player.p.HydroGain = player.p.HydroGain.add(1),
            player.p.HydrogenGas = player.p.HydrogenGas.add(temp['p'].clickables[11].effect).times(tmp.p.effectMult.add(1)),
            player.p.Gas = player.p.Gas.add(temp['p'].clickables[11].effect)
    },
})

addLayer("He", {
    symbol() { return options.toggleButtonAnimations ? '' : 'He' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#00ffff',
            'background-image': 'url("resources/Helium.gif")',
            'background-position': 'center center',
            'background-size': '200%',
            'border': '1px solid #00ffff'
        } : {
            'background-position': 'center center',
        }
    },
    name: "Helium", // This is optional, only used in a few places, If absent it just uses the layer id.
    image: "https://i.postimg.cc/RZMcmXvm/1764b201-ab45-4111-9c8a-646628e64d5c.png", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            total: new Decimal(0),
            points: new Decimal(0),
            HeliumExpunged: new Decimal(0),
            resets: new Decimal(0),
            State: new Decimal(1),
            Inflate: new Decimal(1),
            IText: "Hello",
            BalDiv: new Decimal(0),
            BalDiv1: new Decimal(0),
        }
    },

    layerShown() {
        if (hasUpgrade('p', 21)) return true
        if (player.He.total > 0) return true
        if (player.Li.total > 0) return true
        else return false
    },

    color: "#00ffff ",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Helium", // Name of prestige currency
    baseResource: "Hydrogen", // Name of resource prestige is based on
    baseAmount() { return player.p.points }, // Get the current amount of baseResource
    requires: new Decimal(100),
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        if (hasUpgrade('He', 21)) return 0.5
        else return 0.1
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        { key: "e", description: "E: Reset for Helium", onPress() { if (canReset(this.layer)) doReset(this.layer)},
        unlocked() { if (hasMilestone('Li', 2)) return false
        else return true}},
    ],

    onPrestige() {
        player.He.resets = player.He.resets.add(1)
    },

    tooltip() { return formatWhole(player.He.points) + " Helium" },
    tooltipLocked() { return formatWhole(player.He.points) + " Helium" },

    clickables: {
        11: {
            title: "Inflate",
            display() {
                if (player.He.State > 0) return "On"
                else return "Off"
            },
            unlocked() {
                if (hasMilestone('Li', 5)) return false
                if (hasUpgrade('p', 26)) return true
                else return false
            },
            canClick() {
                return true
            },
            effect() {
                BalMult = new Decimal(1)
                InRate = new Decimal(1)
                cap2 = new Decimal(49)
                cap3 = new Decimal(49)
                cap3 = cap2
                cap3 = cap3.add(-10)
                if (hasUpgrade('p', 26)) cap2 = 49
                player.He.BalDiv = player.He.Inflate
                player.He.BalDiv1 = player.He.Inflate
                if (hasUpgrade('He', 16)) player.He.BalDiv = player.He.BalDiv.times(0.3)
                if (hasUpgrade('He', 23)) player.He.BalDiv = player.He.BalDiv.times(0.1)
                if (hasUpgrade('He', 16)) player.He.BalDiv1 = player.He.BalDiv1.times(0.3)
                if (hasUpgrade('He', 23)) player.He.BalDiv1 = player.He.BalDiv1.times(0.1)
                if (hasUpgrade('He', 24)) player.He.BalDiv1 = player.He.BalDiv1.add(player.He.Inflate.pow(0.7))
                if (hasUpgrade('He', 25)) player.He.BalDiv1 = player.He.BalDiv1.add(player.He.Inflate)
                if (hasMilestone('Li', 1)) player.He.BalDiv1 = player.He.BalDiv1.times(0)
                if (options.mobileMode == true) player.He.BalDiv1 = player.He.BalDiv1.times(0)
                if (hasUpgrade('He', 15) && options.mobileMode == false) InRate = 10
                if (hasUpgrade('He', 24)) InRate = 20
                if (hasUpgrade('He', 14)) cap2 = 499
                if (hasUpgrade('He', 23)) cap2 = 4999
                if (player.He.Inflate > cap2) player.He.Inflate = player.He.Inflate.times(0)
                if (player.He.State > 0) player.He.Inflate = player.He.Inflate.add(InRate)
                return cap2
            },
            onClick() {
                player.He.State = player.He.State.add(1)
            }

        },
        12: {
            title: "Deflate",
            display() {
                if (player.He.State < 1) return "On"
                else return "Off"
            },
            unlocked() {
                if (hasMilestone('Li', 5)) return false
                if (hasUpgrade('p', 26)) return true
                else return false
            },
            effect() {
                BalMult = new Decimal(1)
                if (hasUpgrade('He', 21)) BalMult = BalMult.add((player.He.points).pow(1.1))
                if (hasMilestone('He', 6)) BalMult = softcap(BalMult, new Decimal(200), 0.1)
                if (player.He.State > 0) return ""
                if (player.He.Inflate > 0) player.He.Inflate = player.He.Inflate.add(-InRate), player.He.HeliumExpunged = player.He.HeliumExpunged.add(1).add(player.He.Inflate.pow(0.1)).add(BalMult.times(player.Li.points.add(1).pow(tmp.p.effect5).times(tmp.p.effect6)))
            },
            canClick() {
                return true
            },
            onClick() {
                player.He.State = player.He.State.times(0)
            }
        },
        13: {
            title: "Reset for Helium",
            display: "Hold",
            canClick() {
                return true
            },
            unlocked() {
                if (options.mobileMode == true && !hasMilestone('Li', 2)) return true
                else return false
            },
            onHold() {
                if (canReset(this.layer)) doReset(this.layer)
            },
        },
    },

    automate() {
        if (hasMilestone('Li', 5) && player.He.Inflate <= 0) player.He.State = player.He.State.add(1)
        if (hasMilestone('Li', 5) && player.He.Inflate >= cap3) player.He.State = player.He.State.times(0)
    },

    milestones: {
        1: {
            style: { "color": "#ededed" },
            requirementDescription: "1 Total Helium",
            effectDescription: "Keep 1 Hydrogen milestone per reset.",
            done() { return player.He.total.gte(1) },
            onComplete() { player.E.points = player.E.points.add(1) },
        },
        2: {
            style: { "color": "#ededed" },
            requirementDescription: "2 Total Helium",
            effectDescription: "Keep 1 Hydrogen upgrade per reset.",
            done() { return player.He.total.gte(2) },
            unlocked() {
                if (hasMilestone('He', 1)) return true
            },
        },
        3: {
            style: { "color": "#ededed" },
            requirementDescription: "7 Total Helium",
            effectDescription: "Unlock a multiplier tank but 10x tank capacity. Hydrogen Multiplier starts at 0.1.",
            done() { return player.He.total.gte(7) },
            unlocked() {
                if (hasMilestone('He', 2)) return true
            },
        },
        4: {
            style: { "color": "#ededed" },
            requirementDescription: "10 Helium",
            effectDescription: "Hydrogen Mutiplier now starts at 0.",
            done() { return player.He.points.gte(10) },
            unlocked() {
                if (hasMilestone('He', 3)) return true
            },
        },
        5: {
            style: { "color": "#ededed" },
            requirementDescription: `Have Upgrade "Hydrogen's Lightness"`,
            effectDescription: "You lose all your Helium. ):",
            done() { return hasUpgrade('p', 22) },
            onComplete() { return player.He.points = player.He.points.times(0) },
            unlocked() {
                if (hasMilestone('He', 4)) return true
            },
        },
        6: {
            style: { "color": "#ededed" },
            requirementDescription: "200 Helium",
            effectDescription: "Softcap Helium boost to Hydrogen Exponged gain starting at 200 Helium.",
            done() { if (hasUpgrade('He', 21)) return player.He.points.gte(200) },
            unlocked() {
                if (hasUpgrade('He', 21)) return true
            },
        },
    },

    upgrades: {
        11: {
            title: "Knock Knock",
            description: "Unlock Hydrogen prestige button automation. Gain 1L of Helium from Jules Janssen.",
            cost() { return new Decimal(5) },
            onPurchase() { return player.He.points = player.He.points.add(1) },
            unlocked() {
                if (hasMilestone('He', 2)) return true
                else return false
            },
        },
        12: {
            title: "Who's There?",
            description: "Unlock Hydrogen tank automation.",
            cost() { return new Decimal(10) },
            unlocked() {
                if (hasUpgrade('He', 11)) return true
                else return false
            },
        },
        13: {
            title: "Helium Hydride Corrosion!",
            description: "Remove the exponent of the Helium effects but unlock more Hydrogen upgrades. Keep Cost.",
            cost() { return new Decimal(100) },
            onPurchase() { return player.He.points = player.He.points.add(100), player.p.HydrogenMult = player.p.HydrogenMult.times(0.1), player.p.HydrogenPower = player.p.HydrogenPower.times(0), player.p.points = player.p.points.times(0) },
            unlocked() {
                if (hasUpgrade('He', 12)) return true
                else return false
            },
        },
        14: {
            title: "Natural Gas Extraction. (This is a fart joke).",
            description: "Increase Balloon capcity and Helium Gas Expunged rate.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(500) },
            unlocked() {
                if (hasUpgrade('p', 26)) return true
                else return false
            },
        },
        15: {
            title: "Feel That Superfluidity.",
            description: "Increase Helium Gas Inflate and Deflate gain.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(2500) },
            unlocked() {
                if (hasUpgrade('He', 14)) return true
                else return false
            },
        },
        16: {
            title: "Haha, That Last Upgrade Only Made Things Harder!",
            description: "Reduce image scaling.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(1000) },
            unlocked() {
                if (hasUpgrade('He', 15)) return true
                else return false
            },
        },
        21: {
            title: `Helium "Leak Detection"`,
            description: "Greatly reduce the Helium requirement exponent. Helium now multiplies Helium Expunged gain. Helium Gas no longer has its gas constantly decreasing. Keep 50% of cost.",
            cost() { return new Decimal(200) },
            onPurchase() { return player.He.points = player.He.points.add(100) },
            unlocked() {
                if (hasUpgrade('He', 16)) return true
                else return false
            },
        },
        22: {
            title: "Aww man, no narcotic properties?",
            description: "Automate multiplier button and resetting Hydrogen resets nothing. Increase Inflation and Deflation rate.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(250000) },
            unlocked() {
                if (hasUpgrade('He', 21)) return true
                else return false
            },
        },
        23: {
            title: "Dude, I think I'm getting progressively Higher.",
            description: "Increase Ballon Capacity and reduce image scaling.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(500000) },
            unlocked() {
                if (hasUpgrade('He', 22)) return true
                else return false
            },
        },
        24: {
            title: "I'm Floatingggg.",
            description: "Float. (Balloon gets wider)",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(500000) },
            unlocked() {
                if (hasUpgrade('He', 23)) return true
                else return false
            },
        },
        25: {
            title: "Going 1355.633077 miles an hour.",
            description: "Gas Gas Gas. (Balloon gets mega wide mega quick)",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(1000000) },
            unlocked() {
                if (hasUpgrade('He', 24)) return true
                else return false
            },
        },
        26: {
            title: "Naw man, come on. Don't leave now!",
            description: "Unlock Lithium. Keep cost.",
            currencyDisplayName: "Helium Gas Expunged",
            currencyInternalName: "HeliumExpunged",
            currencyLocation() { return player.He },
            cost() { return new Decimal(69420) },
            onPurchase() { return player.He.HeliumExpunged = player.He.HeliumExpunged.add(69420) },
            unlocked() {
                if (hasUpgrade('He', 25)) return true
                else return false
            },
        },
    },

    infoboxes: {
        lore: {
            title: "Helium",
            body() { return "Another gas at SATP. I've got uh, um, some balloons for uh, um, for a party. Just go ahead and start inflating them once you can." },
        },
    },

    tabFormat: [
        ['infobox', 'lore'],
        ["display-text",
            function () { if (player.p.Node < 1) return 'Helium boosts Hydrogen Power and Hydrogen Gas gain by ' + formatWhole(player.He.points.add(1).pow(tmp.p.effect3).times(tmp.p.effect4)) }],
        ["display-text",
            function () { if (player.p.Node < 1 && hasUpgrade('He', 21)) return 'Helium also boosts Helium Expunged gain by adding ' + format((BalMult)) }],
        "blank",
        "main-display",
        () => (hasMilestone('Li', 2)) ? "" : "prestige-button",
        "blank",
        ["display-text",
            function () { if (player.p.Node < 1) return 'You have done ' + formatWhole(player.He.resets) + ' resets' }],
        "milestones",
        "upgrades",
        "blank",
        ["display-text",
            function () { if (hasUpgrade('p', 26) && player.p.Node < 1) return 'You have ' + format(player.He.HeliumExpunged) + 'L Helium Gas Expunged' }],
        ["display-text",
            function () { if (hasUpgrade('p', 26) && player.p.Node < 1) return 'You have ' + format(player.He.Inflate) + 'L Helium Gas' }],
        ["display-image",
            function () {
                if (hasUpgrade('p', 26) && player.He.Inflate > 3) return 'https://i.postimg.cc/tR1vQzt7/d43opezd7zfz-2494814611-1-prev-ui-1.png'
                if (hasUpgrade('p', 26) && player.He.Inflate < 4) return 'https://i.postimg.cc/fy4chYD0/balloon-pop-hi-794366064-prev-ui-1.png'
            }],
        "clickables",
        "blank",
        () => (player.p.Node < 1) ? "" : ["strict-text-input", "IText"]
    ],

    componentStyles: {
        "display-image"() { return { 'height': `${player.He.BalDiv.add(50)}px`, 'width': `${player.He.BalDiv1.add(50)}px` } },
    },


    passiveGeneration() {
        if (hasMilestone('Li', 3)) return 8
        if (hasMilestone('Li', 2)) return 4
    },

    doReset() {
        let keptMilestones = []
        let keptUpgrades = []
        if (player.Li.resets > 0) keptMilestones.push(...player.He.milestones.slice(0, player.Li.resets))
        if (player.Li.resets > 1) keptUpgrades.push(...player.He.upgrades.slice(0, player.Li.resets))
        layerDataReset(this.layer)
        if (player.Li.resets > 0) player.He.resets = player.He.resets.add(player.Li.resets)
        if (player.Li.resets > 3) player.He.resets = player.He.resets.add(20)
        player.He.upgrades.push(...keptUpgrades)
        player.He.milestones.push(...keptMilestones)
    },
})

addLayer("Li", {
    
    symbol() { return options.toggleButtonAnimations ? '' : 'Li' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#a9a9a9',
            'background-image': 'url("resources/Lithium.gif")',
            'background-position': 'center center',
            'background-size': '190%',
            'border': '1px solid #a9a9a9'
        } : {
            'background-position': 'center center',
        }
    },
    name: "Li", // This is optional, only used in a few places, If absent it just uses the layer id.
    image: "https://i.postimg.cc/qR0xHgF1/49f49e18-b45b-4b40-aef3-318b8b46376d.png", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            resets: new Decimal(0),
            Deg: new Decimal(0),
            Size: new Decimal(0),
            State: new Decimal(0),
            Gain: new Decimal(0),
            Gain2: new Decimal(0),
            Gain3: new Decimal(0),
            Gain4: new Decimal(0),
            Gain5: new Decimal(0),
            Gain6: new Decimal(0),
            Gain7: new Decimal(0),
            Hydrogen: new Decimal(0),
            H1: new Decimal(2),
            H2: new Decimal(100),
            Li1: new Decimal(1),
            Sped: new Decimal(10),
            HM: new Decimal(1),
            H: new Decimal(1),
            Runlock: new Decimal(0),
            Punlock: new Decimal(0),
            Rubidium: new Decimal(0),
            R: new Decimal(1),
            R1: new Decimal(100),
            RM: new Decimal(1),
            HD: new Decimal(1),
            PM: new Decimal(1),
            AlM: new Decimal(1),
            Hp: new Decimal(1),
            Rp: new Decimal(1),
            Lp: new Decimal(1),
            HDp: new Decimal(1),
            Kp: new Decimal(1),
            Alp: new Decimal(1),
            StoreSped: new Decimal(0),
            StoreHydro: new Decimal(0),
            Hydroxide: new Decimal(0),
            Potassium: new Decimal(0),
            Aluminum: new Decimal(0),
            Fluorine: new Decimal(0),
            Silicon: new Decimal(0),
            Francium: new Decimal(0),
            InText: "Input ore name here",
            State2: new Decimal(0),
            State3: new Decimal(0),
            All: new Decimal(0),
            UltraLithium: new Decimal(0),
        }
    },

    UrO: new Decimal(0),
    Inv: new Decimal(0),

    layerShown() {
        if (hasUpgrade('He', 26)) return true
        if (player.Li.resets > 0) return true
        else return false
    },

    color: "#a9a9a9",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Lithium", // Name of prestige currency
    baseResource: "Helium Expunged", // Name of resource prestige is based on
    baseAmount() { return player.He.HeliumExpunged }, // Get the current amount of baseResource
    requires: new Decimal(100000),
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        { key: "l", description: "L: Reset for Lithium", onPress() { if (canReset(this.layer)) doReset(this.layer)}, 
        unlocked() { if (hasMilestone('Li', 5)) return false
        else return true}},
    ],

    onPrestige() {
        player.Li.resets = player.Li.resets.add(1)
    },

    tooltip() { return formatWhole(player.Li.points) + " Lithium" },
    tooltipLocked() { return formatWhole(player.Li.points) + " Lithium" },

    milestones: {
        1: {
            style: { "color": "#ededed" },
            requirementDescription: "1 Lithium Reset",
            effectDescription: "Keep 1 Helium milestone per reset. Get rid of wideness stuff.",
            done() { return player.Li.resets.gte(1) },
            onComplete() { player.E.points = player.E.points.add(1) },
        },
        2: {
            style: { "color": "#ededed" },
            requirementDescription: "2 Lithium Resets",
            effectDescription: "Keep 1 Helium upgrade per reset. Also unlock Helium auto generation. Thin balloon (:<.",
            done() { return player.Li.resets.gte(2) },
            unlocked() {
                if (hasMilestone('Li', 1)) return true
            },
        },
        3: {
            style: { "color": "#ededed" },
            requirementDescription: "3 Lithium Resets",
            effectDescription: "Double Helium generation.",
            done() { return player.Li.resets.gte(3) },
            unlocked() {
                if (hasMilestone('Li', 2)) return true
            },
        },
        4: {
            style: { "color": "#ededed" },
            requirementDescription: "4 Lithium Resets",
            effectDescription: "Keep 20 resets.",
            done() { return player.Li.resets.gte(4) },
            unlocked() {
                if (hasMilestone('Li', 3)) return true
            },
        },
        5: {
            style: { "color": "#ededed" },
            requirementDescription: "12 Lithium Resets",
            effectDescription: "Automate Helium Inflate and Deflate. Also unlock a Lepoidolite. Reset Lithium and remove its button.",
            done() { return player.Li.resets.gte(12) },
            onComplete() { return player.Li.points = player.Li.points.times(0), player.Li.RM = player.Li.RM.times(0)},
            unlocked() {
                if (hasMilestone('Li', 4)) return true
            },
        },
    },

    infoboxes: {
        lore: {
            titleStyle: { "color": "#ededed" },
            title: "Lithium",
            body() { return "We've struck Lithium! I'll- I'll be able to- We'll be able to make phones and electric cars with them. All ya gotta do is mine that Lepoidolite over there. Yeah, I'm gonna be rich!" },
        },
        lore1: {
            titleStyle: { "color": "#ededed" },
            title: "",
            body() { return "I need a new dust filter for my Hoover Max Extract Pressure Pro model 60" }
        },
        lore2: {
            titleStyle: { "color": "#ededed" },
            title: "Lithium",
            body() { return "Holy Shit, we've struck Lithium! I'll- I'll be able to- We'll be able to make phones and electric cars with them. All ya gotta do is mine that Lepoidolite over there. Yeah bitch, I'm gonna be rich!" },
        },
    },


    buyables: {
        11: {
            unlocked() {
                if (hasMilestone('Li', 5)) return true
            },
            cost(x) {
                if (inChallenge('Li', 15)) return new Decimal(10).mul(x).pow(2.9)
                if (inChallenge('Li', 13)) return new Decimal(10).mul(x).pow(4.9)
                else return  new Decimal(10).mul(x).pow(1.9)},
            display() { return "Find more ore.<div> Increases the chance of getting Lithium by 1% per amount.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Unlock new ore." },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            purchaseLimit: 50,
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.Li1 = player.Li.Li1.add(1), player.Li.H1 = player.Li.H1.add(1)
                if (getBuyableAmount(this.layer, this.id) == 50) player.Li.Runlock = player.Li.Runlock.add(1), player.Li.RM = player.Li.RM.add(1), player.Li.H2 = player.Li.H2.sub(1)
            },

        },
        12: {
            unlocked() {
                if (hasMilestone('Li', 5)) return true
            },
            cost(x) { 
                if (inChallenge('Li', 15)) return new Decimal(10).mul(x).pow(2.8)
                if (inChallenge('Li', 13)) return new Decimal(10).mul(x).pow(4.8)
                else return new Decimal(10).mul(x).pow(1.8) },
            display() { return "Hire a worker.<div> Increases mining speed by 1% per amount.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Double mining speed." },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.Sped = player.Li.Sped.add(new Decimal(0.01).times(x))
                if (getBuyableAmount(this.layer, this.id) == 25) player.Li.Sped = player.Li.Sped.times(2)
            },
            purchaseLimit: 25,
        },
        13: {
            unlocked() {
                if (hasMilestone('Li', 5)) return true
            },
            cost(x) { 
                if (inChallenge('Li', 15)) return new Decimal(10).mul(x).pow(2.5)
                if (inChallenge('Li', 13)) return new Decimal(10).mul(x).pow(4.5)
                else return new Decimal(1).mul(x).pow(1.5) },
            display() { return "Use better equipment.<div> Increases the amount of Hydrogen from mineral by 10% per amount.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Double Hydrogen Gain." },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.H = player.Li.H.add(new Decimal(0.1).times(x))
                if (getBuyableAmount(this.layer, this.id) == 100) player.Li.H = player.Li.H.times(2)
            },
            purchaseLimit: 100,
        },
        14: {
            unlocked() {
                if (hasMilestone('Li', 5) && player.Li.Runlock > 0) return true
            },
            cost(x) { 
                if (inChallenge('Li', 15)) return new Decimal(30000).mul(x).pow(2.52)
                if (inChallenge('Li', 13)) return new Decimal(30000).mul(x).pow(2.52)
                else return new Decimal(30000).mul(x).pow(1.02) },
            display() { return "Buy a factory.<div> Increases the chance of getting Rubidium by 1% per amount.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Double Rubidium gain." },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            purchaseLimit: 20,
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.R1 = player.Li.R1.sub(1), player.Li.H2 = player.Li.H2.sub(1)
                if (getBuyableAmount(this.layer, this.id) == 20) player.Li.R = player.Li.R.times(2)
            },
        },
        15: {
            unlocked() {
                if (hasMilestone('Li', 5) && player.Li.Runlock > 0) return true
            },
            cost(x) { 
                if (inChallenge('Li', 15)) return new Decimal(30000).mul(x).pow(2.51)
                if (inChallenge('Li', 13)) return new Decimal(30000).mul(x).pow(2.51)
                else return new Decimal(30000).mul(x).pow(1.01) },
            display() { return "Increase stock market shares.<div> Increases mining speed by 1% per amount.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Double mining speed." },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.Sped = player.Li.Sped.add(new Decimal(0.01).times(x))
               
                if (getBuyableAmount(this.layer, this.id) == 25) player.Li.Sped = player.Li.Sped.times(2)
                if (getBuyableAmount(this.layer, this.id) == 25) player.Li.StoreSped = player.Li.Sped
            },
            purchaseLimit: 25,
        },
        16: {
            unlocked() {
                if (hasMilestone('Li', 5) && player.Li.Runlock > 0) return true
            },
            cost(x) { 
                if (inChallenge('Li', 15)) return new Decimal(1e15).mul(x)
                if (inChallenge('Li', 13)) return new Decimal(1e15).mul(x)
                else return new Decimal(10000000).mul(x)},
            display() { return "Find a portal? <div> Unlocks Lithium challenges. Must have all others at max to get this.<div> Cost: " + format(this.cost()) + "g of Lithium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit)) + "<div> Completion reward: Unlock challenges." },
            canAfford() { 
                if (getBuyableAmount('Li', 16) == 1) return player[this.layer].points.gte(this.cost()) && getBuyableAmount('Li', 11) == 50 && getBuyableAmount('Li', 12) == 25 && getBuyableAmount('Li', 13) == 100 && getBuyableAmount('Li', 14) == 20 && getBuyableAmount('Li', 15) == 25
                else return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                if (getBuyableAmount(this.layer, this.id) == 2) player.Li.Runlock = player.Li.Runlock.add(1), player.Li.Punlock = player.Li.Punlock.add(1) //End of game for now
            },
            purchaseLimit: 2,
        },
    },

    challenges: {
        11: {
            unlocked() { 
                if (hasChallenge('Li', 11)) return false
                else return true
            },
            name: "Buy Out The <div> Competition",
            challengeDescription: "Hydrogen boosts nothing. Keep Rubidium.",
            goalDescription: "Use the best equipment.",
            rewardDescription: "Unlock a new location.",
            canComplete: function() {return getBuyableAmount('Li', 13) == 100},
            style() { if (inChallenge('Li', 11)) return {"background-color" : "#a9a9a9"}},
            onEnter() { return player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.StoreSped = player.Li.Sped,  player.Li.StoreHydro = player.Li.H, player.Li.Runlock = player.Li.Runlock.times(0), player.Li.Hydrogen = player.Li.Hydrogen.times(0), player.Li.points = player.Li.points.times(0), setBuyableAmount('Li', 11, new Decimal(0)), setBuyableAmount('Li', 12, new Decimal(0)), setBuyableAmount('Li', 13, new Decimal(0)), setBuyableAmount('Li', 14, new Decimal(0)), setBuyableAmount('Li', 15, new Decimal(0)), setBuyableAmount('Li', 16, new Decimal(0)), player.Li.Sped = player.Li.Sped.times(0).add(10), player.Li.H = player.Li.H.times(0).add(1), player.Li.H1 = player.Li.H1.times(0).add(2), player.Li.H2 = player.Li.H2.times(0).add(100), player.Li.Li1 = player.Li.Li1.times(0).add(1), player.Li.R1 = player.Li.R1.times(0).add(100)},
            onExit() { return player.Li.Runlock = player.Li.Runlock.add(2), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(20)), setBuyableAmount('Li', 15, new Decimal(25)), setBuyableAmount('Li', 16, new Decimal(2)), player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.H1 = player.Li.H1.times(0).add(53), player.Li.H2 = player.Li.H2.times(0).add(80), player.Li.Li1 = player.Li.Li1.times(0).add(51), player.Li.R1 = player.Li.R1.times(0).add(80)}
        },
        12: {
            unlocked() { 
                if (hasChallenge('Li', 12)) return false
                if (hasChallenge('Li', 11)) return true
            },
            name: "Lobby For Lower <div> Workplace Safety Measures",
            challengeDescription: "Hydrogen boosts nothing. Keep row 1 of buyables, Potassium and Hydroxide.",
            goalDescription: "Have the richest investors.",
            rewardDescription: "Unlock a new ore and Lepoidolite.",
            canComplete: function() {return getBuyableAmount('Li', 15) == 25},
            style() { if (inChallenge('Li', 12)) return {"background-color" : "#a9a9a9"}},
            onEnter() { return player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.RM = player.Li.RM.times(0).add(1), player.Li.StoreSped = player.Li.Sped, player.Li.Runlock = player.Li.Runlock.times(0), player.Li.Hydrogen = player.Li.Hydrogen.times(0), player.Li.Rubidium = player.Li.Rubidium.times(0), player.Li.points = player.Li.points.times(0), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(0)), setBuyableAmount('Li', 15, new Decimal(0)), setBuyableAmount('Li', 16, new Decimal(0)), player.Li.Sped = player.Li.Sped.times(0).add(35), player.Li.R1 = player.Li.R1.times(0).add(100), player.Li.H2 = player.Li.H2.times(0).add(99), player.Li.Runlock = player.Li.Runlock.times(0).add(1)},
            onExit() { return player.Li.Runlock = player.Li.Runlock.add(2), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(20)), setBuyableAmount('Li', 15, new Decimal(25)), setBuyableAmount('Li', 16, new Decimal(2)), player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.H1 = player.Li.H1.times(0).add(53), player.Li.H2 = player.Li.H2.times(0).add(80), player.Li.Li1 = player.Li.Li1.times(0).add(51), player.Li.R1 = player.Li.R1.times(0).add(80)}
        },
        13: {
            unlocked() { 
                if (hasChallenge('Li', 13)) return false
                if (hasChallenge('Li', 12)) return true
            },
            name: "Lower The <div> Minimum Wage",
            challengeDescription: "Keep most things except buyables. Their cost scales much higher",
            goalDescription: "Make it back to the portal.",
            rewardDescription: "Unlock a new location (purely aesthetical) and another Lepoidolite.",
            canComplete: function() {return getBuyableAmount('Li', 16) == 2},
            style() { if (inChallenge('Li', 13)) return {"background-color" : "#a9a9a9"}},
            onEnter() { return player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.StoreSped = player.Li.Sped,  player.Li.StoreHydro = player.Li.H, player.Li.Runlock = player.Li.Runlock.times(0), player.Li.points = player.Li.points.times(0), setBuyableAmount('Li', 11, new Decimal(0)), setBuyableAmount('Li', 12, new Decimal(0)), setBuyableAmount('Li', 13, new Decimal(0)), setBuyableAmount('Li', 14, new Decimal(0)), setBuyableAmount('Li', 15, new Decimal(0)), setBuyableAmount('Li', 16, new Decimal(0)), player.Li.Sped = player.Li.Sped.times(0).add(10), player.Li.H = player.Li.H.times(0).add(1), player.Li.H1 = player.Li.H1.times(0).add(2), player.Li.H2 = player.Li.H2.times(0).add(100), player.Li.Li1 = player.Li.Li1.times(0).add(1), player.Li.R1 = player.Li.R1.times(0).add(100)},
            onExit() { return player.Li.Runlock = player.Li.Runlock.add(2), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(20)), setBuyableAmount('Li', 15, new Decimal(25)), setBuyableAmount('Li', 16, new Decimal(2)), player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.H1 = player.Li.H1.times(0).add(53), player.Li.H2 = player.Li.H2.times(0).add(80), player.Li.Li1 = player.Li.Li1.times(0).add(51), player.Li.R1 = player.Li.R1.times(0).add(80)}
        },
        14: {
            unlocked() { 
                if (hasChallenge('Li', 14)) return false
                if (hasChallenge('Li', 13)) return true
            },
            name: "Withold <div> Valuable Resources",
            challengeDescription: "Lose most things. Potassium boosts nothing.",
            goalDescription: "Get 1e11 Lithium.",
            rewardDescription: "Double mining speed and unlock another Lepoidolite (purely aesthetical).",
            canComplete: function() {return player.Li.points.gte(1e11)},
            onComplete: function() { if (hasChallenge('Li', 14)) return ""
                else return player.Li.Sped = player.Li.Sped.times(2), player.Li.StoreSped = player.Li.Sped},
            style() { if (inChallenge('Li', 14)) return {"background-color" : "#a9a9a9"}},
            onEnter() { return player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.StoreSped = player.Li.Sped,  player.Li.StoreHydro = player.Li.H, player.Li.Runlock = player.Li.Runlock.times(0), player.Li.Hydrogen = player.Li.Hydrogen.times(0), player.Li.points = player.Li.points.times(0), player.Li.Rubidium = player.Li.Rubidium.times(0), setBuyableAmount('Li', 11, new Decimal(0)), setBuyableAmount('Li', 12, new Decimal(0)), setBuyableAmount('Li', 13, new Decimal(0)), setBuyableAmount('Li', 14, new Decimal(0)), setBuyableAmount('Li', 15, new Decimal(0)), setBuyableAmount('Li', 16, new Decimal(0)), player.Li.Sped = player.Li.Sped.times(0).add(10), player.Li.H = player.Li.H.times(0).add(1), player.Li.H1 = player.Li.H1.times(0).add(2), player.Li.H2 = player.Li.H2.times(0).add(100), player.Li.Li1 = player.Li.Li1.times(0).add(1), player.Li.R1 = player.Li.R1.times(0).add(100), player.Li.RM = player.Li.RM.times(0)},
            onExit() { return player.Li.Runlock = player.Li.Runlock.add(2), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(20)), setBuyableAmount('Li', 15, new Decimal(25)), setBuyableAmount('Li', 16, new Decimal(2)), player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.H1 = player.Li.H1.times(0).add(53), player.Li.H2 = player.Li.H2.times(0).add(80), player.Li.Li1 = player.Li.Li1.times(0).add(51), player.Li.R1 = player.Li.R1.times(0).add(80)}
        },
        15: {
            unlocked() { 
                if (hasChallenge('Li', 15)) return false
                if (hasChallenge('Li', 14)) return true
            },
            name: "Become <div> A Monopoly",
            challengeDescription: "Keep most things except buyables. Their cost scales much higher",
            goalDescription: "Fully max out all buyables.",
            rewardDescription: "Unlock Beryllium and another Lepoidolite (purely aesthetical).",
            canComplete: function() {return player.Li.All.gte(1)},
            style() { if (inChallenge('Li', 15)) return {"background-color" : "#a9a9a9"}},
            onEnter() { return player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.StoreSped = player.Li.Sped,  player.Li.StoreHydro = player.Li.H, player.Li.Runlock = player.Li.Runlock.times(0), player.Li.points = player.Li.points.times(0), player.Li.Rubidium = player.Li.Rubidium.times(0), player.Li.Hydrogen = player.Li.Hydrogen.times(0), setBuyableAmount('Li', 11, new Decimal(0)), setBuyableAmount('Li', 12, new Decimal(0)), setBuyableAmount('Li', 13, new Decimal(0)), setBuyableAmount('Li', 14, new Decimal(0)), setBuyableAmount('Li', 15, new Decimal(0)), setBuyableAmount('Li', 16, new Decimal(0)), player.Li.Sped = player.Li.Sped.times(0).add(10), player.Li.H = player.Li.H.times(0).add(1), player.Li.H1 = player.Li.H1.times(0).add(2), player.Li.H2 = player.Li.H2.times(0).add(100), player.Li.Li1 = player.Li.Li1.times(0).add(1), player.Li.R1 = player.Li.R1.times(0).add(100), player.Li.RM = player.Li.RM.times(0)},
            onExit() { return player.Li.Runlock = player.Li.Runlock.add(2), setBuyableAmount('Li', 11, new Decimal(50)), setBuyableAmount('Li', 12, new Decimal(25)), setBuyableAmount('Li', 13, new Decimal(100)), setBuyableAmount('Li', 14, new Decimal(20)), setBuyableAmount('Li', 15, new Decimal(25)), setBuyableAmount('Li', 16, new Decimal(2)), player.Li.Sped = player.Li.StoreSped, player.Li.H = player.Li.StoreHydro, player.Li.H1 = player.Li.H1.times(0).add(53), player.Li.H2 = player.Li.H2.times(0).add(80), player.Li.Li1 = player.Li.Li1.times(0).add(51), player.Li.R1 = player.Li.R1.times(0).add(80)}
        },
    },


    
    tabFormat: {
        "MainTab": {
            content: [
        () => (player.p.Node < 1 && options.matureMode == false) ? ['infobox', 'lore'] : '',
        () => (player.p.Node < 1 && options.matureMode == true) ? ['infobox', 'lore2'] : '',
        () => (player.p.Node >= 1) ? ['infobox', 'lore1'] : '',
        ["display-text",
            function () { if (player.p.Node < 1) return 'Lithium boosts Helium Expunged and Hydrogen Gas + Power gain by ' + formatWhole(player.Li.points.add(1).pow(tmp.p.effect5).times(tmp.p.effect6)) }],
        "blank",
        "main-display",
        () => (hasMilestone('Li', 5)) ? "" : "prestige-button",
        "blank",
        ["display-text",
            function () { if (player.p.Node < 1) return 'You have done ' + formatWhole(player.Li.resets) + ' resets' }],
        ['display-text', 
            function() { return temp.Li.Inv = temp.Li.Inv * 0, ''}],
        "milestones",
        "blank",
        ['display-text',
        function() { if (player.p.Node < 1 && hasMilestone('Li', 5)) return 'Your mining speed is ' + formatWhole(player.Li.Sped)}],
        "blank",
        ["display-text",
            function () { if (player.p.Node < 1 && hasMilestone('Li', 5)) return 'You have ' + format(player.Li.points) + 'g of Lithium from Lepoidolite (Currency).<div> Current chance: ' + formatWhole(player.Li.Li1.add(1)) + ' in 100.' }],
        ["display-text",
            function () { if (player.p.Node < 1 && hasMilestone('Li', 5) && player.Li.Punlock < 1) return 'You have ' + format(player.Li.Hydrogen) + 'L of Hydrogen from Lepoidolite (10% more Lithium per L). <div> Current chance: ' + formatWhole(player.Li.H2.sub(player.Li.H1)) + ' in 100.' }],
        ["display-text",
            function () { if (player.p.Node < 1 && hasMilestone('Li', 5) && player.Li.Punlock < 1 && player.Li.Runlock > 0) return 'You have ' + format(player.Li.Rubidium) + 'g of Rubidium from Lepoidolite (20% more Lithium and Hydrogen per g). <div> Current chance: ' + formatWhole(new Decimal(100).sub(player.Li.R1).add(1)) + ' in 100.' }],
        "blank",
        ["row", function () {
            if (hasMilestone('Li', 5) && player.Li.Punlock < 1) return [
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { 'height': `${player.Li.Size.add(340)}px`, 'width': `${player.Li.Size.add(340)}px` }],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `230px`, width: `230px`, transform: `rotate(${player.Li.Deg}deg)`, position: 'relative', right: '40px' }]
            ]}],
        "blank",
        "buyables",
        ]},
        "Mines": {
            content: [
                ["display-text",
                function () { if (player.p.Node < 1) return '<u><b>______________________________Thacker Pass______________________________'}],
                'blank',
                ['display-text', 
                function() { return temp.Li.Inv = temp.Li.Inv * 0, ''}],
                ["display-text",
                function () { if (player.p.Node < 1) return 'You have ' + format(player.Li.points) + 'g of Lithium from Lepoidolite (Currency).<div> Current chance: ' + formatWhole(player.Li.Li1.add(1)) + ' in 100.' }],
            ["display-text",
                function () { if (player.p.Node < 1) return 'You have ' + format(player.Li.Hydrogen) + 'L of Hydrogen from Lepoidolite (10% more Lithium per L). <div> Current chance: ' + formatWhole(player.Li.H2.sub(player.Li.H1)) + ' in 100.'}],
            ["display-text",
                function () { if (player.p.Node < 1) return 'You have ' + format(player.Li.Rubidium) + 'g of Rubidium from Lepoidolite (20% more Lithium and Hydrogen per g).'}],
            ["display-text",
                function () { if (player.p.Node < 1 && player.Li.Runlock > 0) return 'Current chance: ' + formatWhole(new Decimal(100).sub(player.Li.R1).add(1)) + ' in 100.' }],
            ["row", function () {
                if (player.Li.Punlock > 0) return [
                    ["display-image", 'https://i.postimg.cc/KzRjzdXH/101848.jpg', { 'height': `400px`, 'width': `1000px`, position: 'absolute', right: '10px', top: '250px', id: 'under'}],
                  ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(100)}px`, width: `${player.Li.Size.add(100)}px`, position: 'absolute',  right: '650px', top: "400px", id: 'top'}],
                    ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `83px`, width: `83px`, transform: `rotate(${player.Li.Deg}deg)`,  position: 'absolute', right: '600px', top: '410px', id: 'top'}],
                ]}],
                "blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank",
                ["display-text",
                function () { if (player.p.Node < 1 && hasChallenge('Li', 11)) return '<u><b>______________________________Gaston County______________________________'}],
                'blank',
                ["display-text",
                function () { if (player.p.Node < 1 && hasChallenge('Li', 11)) return 'You have ' + format(player.Li.Hydroxide) + 'L of Hydroxide from Lepoidolite (2x Rubidium per L).<div> Current chance: 1 in 200 per Gaston County Lepoidolite.' }],
                ["display-text",
                function () { if (player.p.Node < 1 && hasChallenge('Li', 11)) return 'You have ' + format(player.Li.Potassium) + 'g of Potassium from Lepoidolite (2x Lithium per g).<div> Current chance: 1 in 200 per Gaston County Lepoidolite.' }],
                ["display-text",
                function () { if (player.p.Node < 1 && hasChallenge('Li', 12)) return 'You have ' + format(player.Li.Aluminum) + 'g of Aluminum from Lepoidolite (10x Potassium and Hydroxide per g).<div> Current chance: 1 in 500.' }],
                "blank",
            ["row", function () {
                if (hasChallenge('Li', 11)) return [
                    ["display-image", 'https://i.postimg.cc/J0zHCPM1/pC6PQx.jpg', { 'height': `400px`, 'width': `1000px`, position: 'absolute', right: '10px', top: '800px', id: 'under'}],
                    ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(130)}px`, width: `${player.Li.Size.add(130)}px`, position: 'absolute',  right: '450px', top: "1050px", id: 'top'}],
                    ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `83px`, width: `83px`, transform: `rotate(${player.Li.Deg}deg)`,  position: 'absolute', right: '400px', top: '1060px', id: 'top'}],
                ]
            }],
            ["row", function () {
            if (hasChallenge('Li', 12)) return [
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(60)}px`, width: `${player.Li.Size.add(60)}px`, position: 'absolute',  right: '100px', top: "1050px", id: 'top'}],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `43px`, width: `43px`, transform: `rotate(${-player.Li.Deg}deg)`,  position: 'absolute', right: '110px', top: '1020px', id: 'top'}],
            ]
        }],
        ["row", function () {
            if (hasChallenge('Li', 13)) return [
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(40)}px`, width: `${player.Li.Size.add(40)}px`, position: 'absolute',  right: '350px', top: "1020px", id: 'top'}],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `33px`, width: `33px`, transform: `rotate(${-player.Li.Deg.add(100)}deg)`,  position: 'absolute', right: '380px', top: '1020px', id: 'top'}],
            ]
        }],
        "blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank","blank",
        ["display-text",
        function () { if (player.p.Node < 1  && hasChallenge('Li', 13)) return '<u><b>______________________________Luna County______________________________'}],
        'blank',
        ["display-text",
        function () { if (player.p.Node < 1 && hasChallenge('Li', 13)) return 'You have ' + format(player.Li.Fluorine) + 'L of Fluorine from Lepoidolite.<div> Current chance: 1 in 1000.' }],
        ["display-text",
        function () { if (player.p.Node < 1 && hasChallenge('Li', 13)) return 'You have ' + format(player.Li.Silicon) + 'g of Silicon from Lepoidolite. <div> Current chance: 1 in 10000.'}],
        ["display-text",
        function () { if (player.p.Node < 1 && hasChallenge('Li', 14)) return 'You have ' + format(player.Li.Francium) + 'g of Francium from Lepoidolite. <div> Current chance: 1 in 124653.'}],
        ["display-text", 
        function () { if (player.p.Node < 1 && hasChallenge('Li', 15)) return 'You have ' + format(player.Li.UltraLithium) + 'g of Ultra Lithium from Lepoidolite. <div> Current chance: 1 in 1000000.'}],
        "blank",
        ["row", function () {
            if (hasChallenge('Li', 13)) return [
                ["display-image", 'https://i.postimg.cc/zBL39mSg/157380-nature-cave-sunlight-ice-frost-glaciers-icicle-snow.jpg', { 'height': `400px`, 'width': `1000px`, position: 'absolute', right: '10px', top: '1380px', id: 'under'}],
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(130)}px`, width: `${player.Li.Size.add(130)}px`, position: 'absolute',  right: '650px', top: "1630px", id: 'top'}],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `83px`, width: `83px`, transform: `rotate(${player.Li.Deg}deg)`,  position: 'absolute', right: '600px', top: '1640px', id: 'top'}],
            ]
        }],
        ["row", function () {
            if (hasChallenge('Li', 14)) return [
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(130)}px`, width: `${player.Li.Size.add(130)}px`, position: 'absolute',  right: '250px', top: "1630px", id: 'top'}],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `83px`, width: `83px`, transform: `rotate(${-player.Li.Deg.add(90)}deg)`,  position: 'absolute', right: '350px', top: '1640px', id: 'top'}],
            ]
        }],
        ["row", function () {
            if (hasChallenge('Li', 15)) return [
                ["display-image", 'https://i.postimg.cc/LXZqjbzG/lepidolite-rough-2978111063-1-prev-ui.png', { height: `${player.Li.Size.add(20)}px`, width: `${player.Li.Size.add(20)}px`, position: 'absolute',  right: '650px', top: "1600px", id: 'top'}],
                ["display-image", 'https://i.postimg.cc/zvVxw5d8/pdp-sq-2910733281-prev-ui.png', { height: `17px`, width: `17px`, transform: `rotate(${-player.Li.Deg.add(90)}deg)`,  position: 'absolute', right: '660px', top: '1600px', id: 'top'}],
            ]
        }],
            ],
            unlocked() { if (player.Li.Punlock > 0) return true
            else return false},
        },
        "Portal": {
            content: [
                ["display-text",
                function () { if (player.p.Node < 1 && hasChallenge('Li', 15)) return 'You have no active portals.'}],
                ['display-text', 
                function() { return temp.Li.Inv = temp.Li.Inv * 0, ''}],
                "challenges"
            ],
            unlocked() { if (player.Li.Punlock > 0) return true
            else return false},
        },
        "Inventory": {
            content: [
                ["strict-text-input", "InText"],
                "blank",
                ['row', [
                    ["display-text",
                    function () { if (player.Li.Hydrogen.gte(1) && player.Li.InText == "Hydrogen" && player.p.Node < 1) return 'Hydrogen' }],
                    ["display-text",
                function () { if (player.Li.points.gte(1) && player.Li.InText == "Lithium" && player.p.Node < 1) return 'Lithium' }],
                ["display-text",
                function () { if (player.Li.Rubidium.gte(1) && player.Li.InText == "Rubidium" && player.p.Node < 1) return 'Rubidium' }],
                ["display-text",
                function () { if (player.Li.Hydroxide.gte(1) && player.Li.InText == "Hydroxide" && player.p.Node < 1) return 'Hydroxide' }],
                ["display-text",
                function () { if (player.Li.Potassium.gte(1) && player.Li.InText == "Potassium" && player.p.Node < 1) return 'Potassium' }],
                ["display-text",
                function () { if (player.Li.Aluminum.gte(1) && player.Li.InText == "Aluminum" && player.p.Node < 1) return 'Aluminum' }],
                ["display-text",
                function () { 
                    if (player.Li.Fluorine.gte(1) && player.Li.InText == "Fluorine" && player.p.Node < 1 && options.mobileMode == false) return  makeShinies(ShinyF), 'Fluorine'
                    if (player.Li.Fluorine.gte(1) && player.Li.InText == "Fluorine" && player.p.Node < 1 && options.mobileMode == true) return  'Fluorine'}],
                ["display-text",
                function () { if (player.Li.Silicon.gte(1) && player.Li.InText == "Silicon" && player.p.Node < 1) return 'Silicon' }],
                ["display-text",
                function () { if (player.Li.Francium.gte(1) && player.Li.InText == "Francium" && player.p.Node < 1) return 'Francium' }],
                ["display-text",
                function () { 
                    if (player.Li.UltraLithium.gte(1) && player.Li.InText == "Ultra Lithium" && player.p.Node < 1 && options.mobileMode == false) return makeShinies(ShinyL), makeShinies(ShinyL1), makeShinies(ShinyL2), 'Ultra Lithium'
                    if (player.Li.UltraLithium.gte(1) && player.Li.InText == "Ultra Lithium" && player.p.Node < 1 && options.mobileMode == true) return 'Ultra Lithium' }],
                    ]],
                ['row', [
                ["display-image", 
                function() { if (player.Li.Hydrogen.gte(1) && player.Li.InText == "Hydrogen") return 'https://i.postimg.cc/FKvVnhXX/Blue-Smoke-Transparent-Images.png'}],
                ["display-image", 
                function() { if (player.Li.points.gte(1) && player.Li.InText == "Lithium") return 'https://i.postimg.cc/R0CXZvsQ/jeronimo-martins-lithium-transparent.png'}],
                ["display-image", 
                function() { if (player.Li.Rubidium.gte(1) && player.Li.InText == "Rubiduium") return 'https://i.postimg.cc/DfCFvzx5/Pollucite.png'}],
                ["display-image", 
                function() { if (player.Li.Hydroxide.gte(1) && player.Li.InText == "Hydroxide") return 'https://i.postimg.cc/SK1f6hx2/slazzer-edit-image-prev-ui.png'}], 
                ["display-image", 
                function() { if (player.Li.Potassium.gte(1) && player.Li.InText == "Potassium") return 'https://i.postimg.cc/ryDnttbP/Potassium-metal-pieces.png'}],
                ["display-image", 
                function() { if (player.Li.Aluminum.gte(1) && player.Li.InText == "Aluminum") return 'https://i.postimg.cc/k49vkhPn/46690-30-prev-ui.png'}],
                ["display-image", 
                function() { if (player.Li.Fluorine.gte(1) && player.Li.InText == "Fluorine") return 'https://i.postimg.cc/gcyPGzcH/slazzer-edit-image-prev-ui.png'}],
                ["display-image", 
                function() { if (player.Li.Silicon.gte(1) && player.Li.InText == "Silicon") return temp.Li.Inv = temp.Li.Inv + 1, 'https://i.postimg.cc/VkffxSjt/583f68fde02ba760658b5f40-prev-ui.png'
                else return temp.Li.Inv = temp.Li.Inv * 0, ''}],
                ["row", function () {
                    if (player.Li.UltraLithium.gte(1) && player.Li.InText == "Ultra Lithium") return [
                        ["display-image", 'https://i.postimg.cc/NFxV4sfc/C29-BCJ-1-prev-ui.png', {position: 'absolute', right: '200px', top: '150px', id: 'under'}],
                        ["display-image", 'https://i.postimg.cc/qRCYSf4N/image-3.png', {opacity: temp.Li.UrO, position: 'absolute', right: '200px', top: '150px', id: 'top'}],
                        "blank",
                        ]}],
                ["row", function () {
            if (player.Li.Francium.gte(1) && player.Li.InText == "Francium") return [
                ["display-image", 'https://i.postimg.cc/nzJRR3cx/s13-prev-ui.png', {position: 'absolute', right: '200px', top: '100px', id: 'under'}],
                ["display-image", 'https://i.postimg.cc/kXKbWHJM/image.png', {opacity: temp.Li.UrO, position: 'absolute', right: '200px', top: '100px', id: 'top'}],
                "blank",
                ]}]]],
        ],
        unlocked() { if (hasMilestone('Li', 5)) return true
    else return false}
    }, 
    },

    const: ShinyL2 = {
        image() { 
            if (player.Li.State2 == 0) return 'https://i.postimg.cc/5tkypz2x/image-4.png'
            if (player.Li.State2 == 1) return 'https://i.postimg.cc/DZ9Z3KGH/image-5.png'},
        style: { "background-size": "100% 100%" },
        gravity: 0.1,
        time: 1,
        x: 945,
        y: 1170,
        dir() { return (Math.random() + 1) * 9},
        offset: () => Math.random() + 1.2 * 700,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8  
        },
    },

    const: ShinyL1 = {
        image() { 
            if (player.Li.State2 == 0) return 'https://i.postimg.cc/5tkypz2x/image-4.png'
            if (player.Li.State2 == 1) return 'https://i.postimg.cc/DZ9Z3KGH/image-5.png'},
        style: { "background-size": "100% 100%" },
        gravity: 1,
        time: 2,
        x: 1150,
        y: 150,
        dir() { return (Math.random() + 4) * -10},
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8  
        },
    },

    const: ShinyL = {
        image() { 
            if (player.Li.State2 == 0) return 'https://i.postimg.cc/5tkypz2x/image-4.png'
            if (player.Li.State2 == 1) return 'https://i.postimg.cc/DZ9Z3KGH/image-5.png'},
        style: { "background-size": "100% 100%" },
        gravity: 1,
        time: 2,
        x: 1150,
        y: 150,
        dir() { return (Math.random() + 4) * 10},
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8  
        },
    },

    const: ShinyS = {
        image: 'https://i.postimg.cc/X7ktVhQG/image-2.png',
        style: { "background-size": "100% 100%" },
        gravity: 0.01,
        time: 1,
        x: 575,
        y: 850,
        dir() { return (Math.random() + 4) * 10},
        offset: () => Math.random() + 1.2 * 700,
        speed() { // Randomize speed a bit
            return (0.1) 
        },
    },

    const: ShinyF = {
        image: 'https://i.postimg.cc/D0rsV1Qs/image-1.png',
        style: { "background-size": "100% 100%" },
        gravity: 0.1,
        time: 0.8,
        spread: 10,
        x: 875,
        y: 1050,
        offset: () => Math.random() + 1.2 * 700,
        dir() {return (Math.random() + 1.2) * 8},
        speed() { // Randomize speed a bit
            return (0.1) 
        },
    },

    const: myParticle = {
        image: 'https://i.postimg.cc/DfCFvzx5/Pollucite.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: myParticle1 = {
        image: 'https://i.postimg.cc/FKvVnhXX/Blue-Smoke-Transparent-Images.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: myParticle2 = {
        image: 'https://i.postimg.cc/R0CXZvsQ/jeronimo-martins-lithium-transparent.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: HydroxideP = {
        image: 'https://i.postimg.cc/SK1f6hx2/slazzer-edit-image-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: PottasiumP = {
        image: 'https://i.postimg.cc/ryDnttbP/Potassium-metal-pieces.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    
    const: AluminumP = {
        image: 'https://i.postimg.cc/k49vkhPn/46690-30-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: FluorineP = {
        image: 'https://i.postimg.cc/gcyPGzcH/slazzer-edit-image-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: SiliconP = {
        image: 'https://i.postimg.cc/VkffxSjt/583f68fde02ba760658b5f40-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: FranciumP = {
        image: 'https://i.postimg.cc/nzJRR3cx/s13-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    const: LithiumUP = {
        image: 'https://i.postimg.cc/NFxV4sfc/C29-BCJ-1-prev-ui.png',
        style: { "background-size": "100% 100%" },
        gravity: 2,
        time: 1,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8
        },
    },

    automate() {
        if (player.Li.Size == 10) player.Li.Size = player.Li.Size.times(0)
        if (getBuyableAmount('Li', 15) == 25) player.Li.StoreSped = player.Li.Sped
        if (getBuyableAmount('Li', 16) == 2) player.Li.Punlock = player.Li.Punlock.times(0).add(1)
        if (getBuyableAmount('Li', 11) == 50 && getBuyableAmount('Li', 12) == 25 && getBuyableAmount('Li', 13) == 100 && getBuyableAmount('Li', 14) == 20 && getBuyableAmount('Li', 15) == 25 && getBuyableAmount('Li', 16) == 2) player.Li.All = player.Li.All.add(1)
        else player.Li.All = player.Li.All.times(0)
        if (player.Li.Deg < 280) player.Li.State = 1
        if (player.Li.Deg > 360) player.Li.State = 0
        if (player.Li.State == 1) player.Li.Deg = player.Li.Deg.add(player.Li.Sped), temp.Li.UrO = temp.Li.UrO.sub(0.2)
        if (player.Li.State == 0) player.Li.Deg = player.Li.Deg.add(-player.Li.Sped), temp.Li.UrO = temp.Li.UrO.add(0.2)
        if (player.Li.Deg <= 280) player.Li.Size = player.Li.Size.add(4)
        if (player.Li.Size >= 1) player.Li.Size = player.Li.Size.add(-1)
        player.Li.Hp = player.Li.H.add(player.Li.RM)
        if (player.Li.Hp > 10) player.Li.Hp = player.Li.Hp.times(0).add(10)
        player.Li.Lp = player.Li.HM.add(player.Li.RM)
        if (player.Li.Lp > 10) player.Li.Lp = player.Li.Lp.times(0).add(10)
        player.Li.Rp = player.Li.R
        if (player.Li.Rp > 10) player.Li.Rp = player.Li.Rp.times(0).add(10)
        player.Li.HDp = player.Li.AlM
        if (player.Li.HDp > 10) player.Li.HDp = player.Li.HDp.times(0).add(10)
        player.Li.Kp = player.Li.AlM
        if (player.Li.Kp > 10) player.Li.Kp = player.Li.Kp.times(0).add(10)
        player.Li.Alp = new Decimal(1)
        if (player.Li.Alp > 10) player.Li.Alp = player.Li.Alp.times(0).add(10)
        if (options.disableParticles == false) player.Li.Rp = player.Li.Rp.times(0), player.Li.Alp = player.Li.Alp.times(0), player.Li.Lp = player.Li.Lp.times(0), player.Li.Hp = player.Li.Hp.times(0),  player.Li.HDp = player.Li.HDp.times(0), player.Li.Kp = player.Li.Kp.times(0)
        if (hasMilestone('Li', 5) && player.Li.Size == 2) player.Li.Gain = new Decimal(Math.floor(Math.random() * 100) + 1)
        if (player.Li.Gain.gte(player.Li.H1) && player.Li.Gain.lte(player.Li.H2) && player.Li.Size == 2 && hasMilestone('Li', 5)) player.Li.HM = player.Li.Hydrogen.times(1.1), player.Li.Hydrogen = player.Li.Hydrogen.add(player.Li.H).add(player.Li.RM)
        if (inChallenge('Li', 11)) player.Li.HM = player.Li.HM.times(0)
        if (inChallenge('Li', 12)) player.Li.HM = player.Li.HM.times(0)
        if (player.Li.Gain.gte(1) && player.Li.Gain.lte(player.Li.Li1) && player.Li.Size == 2 && hasMilestone('Li', 5)) player.Li.points = player.Li.points.add(player.Li.HM.add(player.Li.RM).times(player.Li.PM).times(player.Be.LB).times(player.Be.LB2))
        if (player.Li.Gain.gte(player.Li.R1) && player.Li.Gain.lte(100) && player.Li.Size == 2 && hasMilestone('Li', 5) && player.Li.Runlock > 0) player.Li.Rubidium = player.Li.Rubidium.add(player.Li.R.times(player.Li.HD)), player.Li.RM = player.Li.Rubidium.times(1.2)
        if (player.Li.Gain.gte(player.Li.H1) && player.Li.Gain.lte(player.Li.H2) && player.Li.Size == 2 && hasMilestone('Li', 5) && player.tab == this.layer) makeParticles(myParticle1, player.Li.Hp)
        if (player.Li.Gain.gte(1) && player.Li.Gain.lte(player.Li.Li1) && player.Li.Size == 2 && hasMilestone('Li', 5) && player.tab == this.layer) makeParticles(myParticle2, player.Li.Lp)
        if (player.Li.Gain.gte(player.Li.R1) && player.Li.Gain.lte(100) && player.Li.Size == 2 && hasMilestone('Li', 5) && player.Li.Runlock > 0 && player.tab == this.layer) makeParticles(myParticle, player.Li.Rp)
        if (hasChallenge('Li', 11) && player.Li.Size == 2) player.Li.Gain2 = new Decimal(Math.floor(Math.random() * 200) + 1)
        if (player.Li.Gain2 == 200 && hasChallenge('Li', 11) && player.Li.Size == 2) player.Li.Hydroxide = player.Li.Hydroxide.add(1), player.Li.HD = player.Li.Hydroxide.times(2)
        if (player.Li.Gain2 == 100 && hasChallenge('Li', 11) && player.Li.Size == 2) player.Li.Potassium = player.Li.Potassium.add(1), player.Li.PM = player.Li.Potassium.times(2)
        if (player.Li.Gain2 == 200 && player.Li.Size == 2 && hasChallenge('Li', 11) && player.tab == this.layer) makeParticles(HydroxideP, player.Li.HDp)
        if (player.Li.Gain2 == 100 && player.Li.Size == 2 && hasChallenge('Li', 11) && player.tab == this.layer) makeParticles(PottasiumP, player.Li.Kp)
        if (hasChallenge('Li', 12) && player.Li.Size == 2) player.Li.Gain3 = new Decimal(Math.floor(Math.random() * 500) + 1)
        if (player.Li.Gain3.gte(1) && player.Li.Gain3.lte(3) && hasChallenge('Li', 12) && player.Li.Size == 2) player.Li.Hydroxide = player.Li.Hydroxide.add(new Decimal(1).times(player.Li.AlM)), player.Li.HD = player.Li.Hydroxide.times(2)
        if (player.Li.Gain3.gte(4) && player.Li.Gain3.lte(6) && hasChallenge('Li', 12) && player.Li.Size == 2) player.Li.Potassium = player.Li.Potassium.add(new Decimal(1).times(player.Li.AlM)), player.Li.PM = player.Li.Potassium.times(2)
        if (inChallenge('Li', 14)) player.Li.PM = player.Li.PM.times(0).add(1)
        if (player.Li.Gain3.gte(1) && player.Li.Gain3.lte(3) && player.Li.Size == 2 && hasChallenge('Li', 12) && player.tab == this.layer) makeParticles(HydroxideP, player.Li.HDp)
        if (player.Li.Gain3.gte(4) && player.Li.Gain3.lte(6) && player.Li.Size == 2 && hasChallenge('Li', 12) && player.tab == this.layer) makeParticles(PottasiumP, player.Li.Kp)
        if (player.Li.Gain3 == 99 && hasChallenge('Li', 12) && player.Li.Size == 2) player.Li.Aluminum = player.Li.Aluminum.add(1), player.Li.AlM = player.Li.Aluminum.times(10)
        if (player.Li.Gain3 == 99 && player.Li.Size == 2 && hasChallenge('Li', 12) && player.tab == this.layer) makeParticles(AluminumP, player.Li.Alp)
        if (hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Gain4 = new Decimal(Math.floor(Math.random() * 200) + 1)
        if (player.Li.Gain4 == 200 && hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Hydroxide = player.Li.Hydroxide.add(1), player.Li.HD = player.Li.Hydroxide.times(2)
        if (player.Li.Gain4 == 100 && hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Potassium = player.Li.Potassium.add(1), player.Li.PM = player.Li.Potassium.times(2)
        if (player.Li.Gain4 == 200 && player.Li.Size == 2 && hasChallenge('Li', 13) && player.tab == this.layer) makeParticles(HydroxideP, player.Li.HDp)
        if (player.Li.Gain4 == 100 && player.Li.Size == 2 && hasChallenge('Li', 13) && player.tab == this.layer) makeParticles(PottasiumP, player.Li.Kp)
        if (hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Gain5 = new Decimal(Math.floor(Math.random() * 10000) + 1)
        if (player.Li.Gain5.gte(1) && player.Li.Gain5.lte(10) && hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Fluorine = player.Li.Fluorine.add(1)
        if (player.Li.Gain5 == 20 && hasChallenge('Li', 13) && player.Li.Size == 2) player.Li.Silicon = player.Li.Silicon.add(1)
        if (player.Li.Gain5.gte(1) && player.Li.Gain5.lte(10) && player.Li.Size == 2 && hasChallenge('Li', 13) && player.tab == this.layer) makeParticles(FluorineP, player.Li.Alp)
        if (player.Li.Gain5 == 20 && player.Li.Size == 2 && hasChallenge('Li', 13) && player.tab == this.layer) makeParticles(SiliconP, player.Li.Alp)
        if (hasChallenge('Li', 14) && player.Li.Size == 2) player.Li.Gain6 = new Decimal(Math.floor(Math.random() * 124653) + 1)
        if (player.Li.Gain6 == 17777 && hasChallenge('Li', 14) && player.Li.Size == 2) player.Li.Francium = player.Li.Francium.add(1)
        if (player.Li.Gain6 == 17777 && player.Li.Size == 2 && hasChallenge('Li', 14) && player.tab == this.layer) makeParticles(FranciumP, player.Li.Alp)
        if (hasChallenge('Li', 14) && player.Li.Size == 2) player.Li.Gain7 = new Decimal(Math.floor(Math.random() * 1000000) + 1)
        if (player.Li.Gain7 == 50 && hasChallenge('Li', 15) && player.Li.Size == 2) player.Li.LithiumUP = player.Li.LithiumUP.add(1)
        if (player.Li.Gain7 == 50 && player.Li.Size == 2 && hasChallenge('Li', 15) && player.tab == this.layer) makeParticles(LithiumUP, player.Li.Alp)
        if (temp.Li.UrO.gte(1.2)) player.Li.State2 = 1
        if (temp.Li.UrO.lte(-0.5)) player.Li.State2 = 0
        if (player.Li.State2 == 1 && player.tab == this.layer) temp.Li.UrO = temp.Li.UrO.sub(0.1)
        if (player.Li.State2 == 0 && player.tab == this.layer) temp.Li.UrO = temp.Li.UrO.add(0.1)
        if (player.Li.State3.gte(10) && temp.Li.Inv >= 1 && player.tab == this.layer && options.mobileMode == false) makeShinies(ShinyS), player.Li.State3 = player.Li.State3.times(0)
        if (player.Li.State3 < 10 && temp.Li.Inv >= 1 && player.tab == this.layer && options.mobileMode == false) player.Li.State3 = player.Li.State3.add(1)
    },
})

addLayer("Be", {
    symbol() { return options.toggleButtonAnimations ? '' : 'Be' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#8B0000',
            'background-image': 'url("resources/Beryllium.gif")',
            'background-position': 'center center',
            'background-size': '160%',
            'border': '1px solid #8B0000'
        } : {}
    },
    name: "Beryllium", // This is optional, only used in a few places, If absent it just uses the layer id.
    image: "https://i.postimg.cc/fWd1ZqQ0/Screenshot-2022-07-06-112019-removebg-preview-1.png", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            total: new Decimal(0),
            points: new Decimal(0),
            BerylliumPlates: new Decimal(0),
            Badd: new Decimal(0),
            LB: new Decimal(1),
            LB2: new Decimal(1),
            Stored: new Decimal(1),
            Stored1: new Decimal(1),
            Current: new Decimal(1),
            Rocketships: new Decimal(0),
            Activeships: new Decimal(0),
            position1: new Decimal(0),
            position2: new Decimal(0),
            position3: new Decimal(0),
            position4: new Decimal(0),
            position5: new Decimal(0),
            position6: new Decimal(0),
            position7: new Decimal(0),
            position8: new Decimal(0),
            position9: new Decimal(0),
            position10: new Decimal(0),
            position11: new Decimal(0),
            position12: new Decimal(0),
            position13: new Decimal(0),
            position14: new Decimal(0),
            position15: new Decimal(0),
            position16: new Decimal(0),
            position17: new Decimal(0),
            position18: new Decimal(0),
            position19: new Decimal(0),
            position20: new Decimal(0),
            s1: new Decimal(0),
            s2: new Decimal(0),
            s3: new Decimal(0),
            s4: new Decimal(0),
            s5: new Decimal(0),
            s6: new Decimal(0),
            s7: new Decimal(0),
            s8: new Decimal(0),
            s9: new Decimal(0),
            s10: new Decimal(0),
            moonDust: new Decimal(0),
            moltenIron: new Decimal(0),
            venusDust: new Decimal(0),
            sulfuricAcid: new Decimal(0), 
            mercuryDust: new Decimal(0),
            metalliccore: new Decimal(0),
            marsDust: new Decimal(0),
            basaltrock: new Decimal(0),
            jupiterHydrogen: new Decimal(0),
            jupiterHelium: new Decimal(0),
            solarEssence: new Decimal(0),
            solarBar: new Decimal(0),
            saturnIce: new Decimal(0),
            methaneGas: new Decimal(0),
            plutoCarbon: new Decimal(0),
            plutonium: new Decimal(0),
            uranusWater: new Decimal(0),
            uranusAmmonia: new Decimal(0),
            neptuneCloud: new Decimal(0),
            neptuneSlush: new Decimal(0), 
            ALight: new Decimal(0),
            gHeliumHydride: new Decimal(0),
            bunknown: new Decimal(0),
            lWaterCloud: new Decimal(0),
            jDiamond: new Decimal(0),
            gwa: new Decimal(0),
            laser: new Decimal(0),
            rainbownium: new Decimal(0),
            dirt: new Decimal(0),
            egg: new Decimal(0),
            auto: new Decimal(0),
        }
    },

    layerShown() {
        if (hasChallenge('Li', 15)) return true
        else return false
    },

    autoPrestige() { if (hasMilestone('B', 2)) return true },

    color: "#8B0000",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Beryllium Scraps", // Name of prestige currency
    baseResource: "Lithium", // Name of resource prestige is based on
    baseAmount() { return player.Li.points }, // Get the current amount of baseResource
    requires: new Decimal(1e16),
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {  
        if (hasUpgrade('Be', 14)) return 0.8
        if (hasUpgrade('Be', 11)) return 1.2
        else return 1.6}, // Prestige currency exponent
    gainMult: new Decimal(1), 
    gainExp: new Decimal(1),
    row: 1, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        { key: "b", description: "B: Reset for Beryllium Scraps", onPress() { if (canReset(this.layer)) doReset(this.layer)}, 
        unlocked() { if (hasMilestone('Be', 2)) return false
        else return true}},
    ],

onPrestige() {
    player.Be.points = player.Be.points.add(player.Be.Badd)
},

    tooltip() { return formatWhole(player.Be.points) + " Beryllium Scraps" },
    tooltipLocked() { return formatWhole(player.Be.points) + " Beryllium Scraps" },

    milestones: {
        1: {
            style: { "color": "#ededed" },
            requirementDescription: "1 Beryllium Scrap",
            effectDescription: "Keep everything.",
            done() { return player.Be.points.gte(1) },
            onComplete() {
                if (player.B.resets < 1) player.E.points = player.E.points.add(1) },
        },
        2: {
            style: { "color": "#ededed" },
            requirementDescription: "Have The Maxmum Of All Rocketship Parts",
            effectDescription: "Unlock Le Universe",
            done() { return getBuyableAmount(this.layer, 12) == 10 && getBuyableAmount(this.layer, 13) == 10 && getBuyableAmount(this.layer, 14) == 10 && getBuyableAmount(this.layer, 15) == 10 && getBuyableAmount(this.layer, 16) == 10},
        },
    },

    upgrades: {
        11: {
            style: { "color": "#ededed" },
            title: "Riddle Me",
            description: "Reduce Beryllium's cost exponent by 0.4. Keep Cost.",
            cost() { return new Decimal(9)},
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost)},
            unlocked() {
                if (hasMilestone('Be', 1)) return true
                else return false
            },
        },
        12: {
            style: { "color": "#ededed" },
            title: "This Batman",
            description: "Beryllium Scrap to Plate converter's scaling is reset. Keep Cost.",
            cost() { return new Decimal(15) },
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost), player.Be.Stored = player.Be.Stored.times(0).add(1), player.Be.Stored1 = player.Be.Stored1.times(0).add(1), player.Be.Current = player.Be.Current.times(0).add(1)},
            unlocked() {
                if (hasUpgrade('Be', 11)) return true
                else return false
            },
        },
        13: {
            style: { "color": "#ededed" },
            title: "If Quizzes",
            description: "Beryllium Scrap to Plate converter's scaling is reset again. Keep Cost.",
            cost() { return new Decimal(22) },
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost), player.Be.Stored = player.Be.Stored.times(0).add(1), player.Be.Stored1 = player.Be.Stored1.times(0).add(1), player.Be.Current = player.Be.Current.times(0).add(1)},
            unlocked() {
                if (hasUpgrade('Be', 12)) return true
                else return false
            },
        },
        14: {
            style: { "color": "#ededed" },
            title: "Are Quizzical",
            description: "Reduce Beryllium cost exponent by 0.4 again. Keep Cost.",
            cost() { return new Decimal(23)},
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost)},
            unlocked() {
                if (hasUpgrade('Be', 13)) return true
                else return false
            },
        },
        15: {
            style: { "color": "#ededed" },
            title: "Then",
            description: "Beryllium Scrap to Plate converter's scaling is reset <i>again</i>. Keep Cost.",
            cost() { return new Decimal(56)},
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost), player.Be.Stored = player.Be.Stored.times(0).add(1), player.Be.Stored1 = player.Be.Stored1.times(0).add(1), player.Be.Current = player.Be.Current.times(0).add(1)},
            unlocked() {
                if (hasUpgrade('Be', 14)) return true
                else return false
            },
        },
        21: {
            style: { "color": "#ededed" },
            title: "What",
            description: "Woah who would have guessed, Beryllium Scrap to Plate converter's scaling is reset. Keep Cost.",
            cost() { return new Decimal(60)},
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost), player.Be.Stored = player.Be.Stored.times(0).add(1), player.Be.Stored1 = player.Be.Stored1.times(0).add(1), player.Be.Current = player.Be.Current.times(0).add(1)},
            unlocked() {
                if (hasUpgrade('Be', 15)) return true
                else return false
            },
        },
        22: {
            style: { "color": "#ededed" },
            title: "Are",
            description: "BeRyLlIuM ScrAp To PlAtE CoNvErTeR's ScAlInG Is ReSeT. KeEp CoSt.",
            cost() { return new Decimal(80)},
            onPurchase() { return player.Be.points = player.Be.points.add(this.cost), player.Be.Stored = player.Be.Stored.times(0).add(1), player.Be.Stored1 = player.Be.Stored1.times(0).add(1), player.Be.Current = player.Be.Current.times(0).add(1)},
            unlocked() {
                if (hasUpgrade('Be', 21)) return true
                else return false
            },
        },
        31: {
            style: { "color": "#ededed" },
            title: "Tests?",
            description: "Guess. Jk, makes Beryllium Scrap to Plate converter cost nothing.",
            cost() { return new Decimal(89)},
            unlocked() {
                if (hasUpgrade('Be', 22)) return true
                else return false
            },
        },
    },

    clickables: {
        11: {
            style() {if (temp['Be'].clickables[11].canClick == true) return {color: "#000000", 'background-color': '#ededed', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Planet gwa",
            display() { if (temp['Be'].clickables[11].canClick == true) return '":gwa:"'
                        else return 'Must have 10 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(10)) return true
               else return false
            },
            onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(200), player.Be.position2 = player.Be.position2.times(0).add(-1220)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(200), player.Be.position4 = player.Be.position4.times(0).add(-1160)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(200), player.Be.position6 = player.Be.position6.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(200), player.Be.position8 = player.Be.position8.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(200), player.Be.position10 = player.Be.position10.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(200), player.Be.position12 = player.Be.position12.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(200), player.Be.position14 = player.Be.position14.times(0).add(-840)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(200), player.Be.position16 = player.Be.position16.times(0).add(-780)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(200), player.Be.position18 = player.Be.position18.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(200), player.Be.position20 = player.Be.position20.times(0).add(-660)
            },
        },
        12: {
            style() {if (temp['Be'].clickables[12].canClick == true) return {color: "#2E2616", 'background-color': '#A9AB8E', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Death Star",
            display() { if (temp['Be'].clickables[12].canClick == true) return `"That's not a Planet!"`
                        else return 'Must have 10 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(10)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(80), player.Be.position2 = player.Be.position2.times(0).add(-1220)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(80), player.Be.position4 = player.Be.position4.times(0).add(-1160)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(80), player.Be.position6 = player.Be.position6.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(80), player.Be.position8 = player.Be.position8.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(80), player.Be.position10 = player.Be.position10.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(80), player.Be.position12 = player.Be.position12.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(80), player.Be.position14 = player.Be.position14.times(0).add(-840)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(80), player.Be.position16 = player.Be.position16.times(0).add(-780)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(80), player.Be.position18 = player.Be.position18.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(80), player.Be.position20 = player.Be.position20.times(0).add(-660)
            },
        },
        13: {
            style() {if (temp['Be'].clickables[13].canClick == true) return {color: "#00000", Animation: 'Rainbow 5s ease-out infinite normal', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "MultiOrb",
            display() { if (temp['Be'].clickables[13].canClick == true) return '"Planet of MultiSplendor"'
                        else return 'Must have 10 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(10)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-40), player.Be.position2 = player.Be.position2.times(0).add(-1220)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-40), player.Be.position4 = player.Be.position4.times(0).add(-1160)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-40), player.Be.position6 = player.Be.position6.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-40), player.Be.position8 = player.Be.position8.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-40), player.Be.position10 = player.Be.position10.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-40), player.Be.position12 = player.Be.position12.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-40), player.Be.position14 = player.Be.position14.times(0).add(-840)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-40), player.Be.position16 = player.Be.position16.times(0).add(-780)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-40), player.Be.position18 = player.Be.position18.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-40), player.Be.position20 = player.Be.position20.times(0).add(-660)
            },
        },
        14: {
            style() {if (temp['Be'].clickables[14].canClick == true) return {color: "#A5D748", 'background-color': '#19340D', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Genviron",
            display() { if (temp['Be'].clickables[14].canClick == true) return '"Earthy Mulch"'
                        else return 'Must have 10 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(10)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-160), player.Be.position2 = player.Be.position2.times(0).add(-1220)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-160), player.Be.position4 = player.Be.position4.times(0).add(-1160)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-160), player.Be.position6 = player.Be.position6.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-160), player.Be.position8 = player.Be.position8.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-160), player.Be.position10 = player.Be.position10.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-160), player.Be.position12 = player.Be.position12.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-160), player.Be.position14 = player.Be.position14.times(0).add(-840)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-160), player.Be.position16 = player.Be.position16.times(0).add(-780)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-160), player.Be.position18 = player.Be.position18.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-160), player.Be.position20 = player.Be.position20.times(0).add(-660)
            },
        },
        15: {
            style() {if (temp['Be'].clickables[15].canClick == true) return {color: "#71181E", 'background-color': '#E5DCD6', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Haumea",
            display() { if (temp['Be'].clickables[15].canClick == true) return '"Eggs Benedict"'
                        else return 'Must have 10 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(10)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-280), player.Be.position2 = player.Be.position2.times(0).add(-1220)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-280), player.Be.position4 = player.Be.position4.times(0).add(-1160)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-280), player.Be.position6 = player.Be.position6.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-280), player.Be.position8 = player.Be.position8.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-280), player.Be.position10 = player.Be.position10.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-280), player.Be.position12 = player.Be.position12.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-280), player.Be.position14 = player.Be.position14.times(0).add(-840)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-280), player.Be.position16 = player.Be.position16.times(0).add(-780)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-280), player.Be.position18 = player.Be.position18.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-280), player.Be.position20 = player.Be.position20.times(0).add(-660)
            },
        },
        21: {
            style() {if (temp['Be'].clickables[21].canClick == true) return {color: "#FBF0D1", 'background-color': '#F4CE98', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "55 Cancri A",
            display() { if (temp['Be'].clickables[21].canClick == true) return '"Cancer"'
                        else return 'Must have 5 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(5)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(200), player.Be.position2 = player.Be.position2.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(200), player.Be.position4 = player.Be.position4.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(200), player.Be.position6 = player.Be.position6.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(200), player.Be.position8 = player.Be.position8.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(200), player.Be.position10 = player.Be.position10.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(200), player.Be.position12 = player.Be.position12.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(200), player.Be.position14 = player.Be.position14.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(200), player.Be.position16 = player.Be.position16.times(0).add(-660)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(200), player.Be.position18 = player.Be.position18.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(200), player.Be.position20 = player.Be.position20.times(0).add(-540)
            },
        },
        22: {
            style() {if (temp['Be'].clickables[22].canClick == true) return {color: "#717BC4", 'background-color': '#333C6F', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Galileo",
            display() { if (temp['Be'].clickables[22].canClick == true) return '"Warm Jupiter"'
                        else return 'Must have 5 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(5)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(80), player.Be.position2 = player.Be.position2.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(80), player.Be.position4 = player.Be.position4.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(80), player.Be.position6 = player.Be.position6.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(80), player.Be.position8 = player.Be.position8.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(80), player.Be.position10 = player.Be.position10.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(80), player.Be.position12 = player.Be.position12.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(80), player.Be.position14 = player.Be.position14.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(80), player.Be.position16 = player.Be.position16.times(0).add(-660)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(80), player.Be.position18 = player.Be.position18.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(80), player.Be.position20 = player.Be.position20.times(0).add(-540)
            },
        },
        23: {
            style() {if (temp['Be'].clickables[23].canClick == true) return {color: "#BDBFC4", 'background-color': '#8E9393', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Brahe",
            display() { if (temp['Be'].clickables[23].canClick == true) return '"Tycho Brahe"'
                        else return 'Must have 5 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(5)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-40), player.Be.position2 = player.Be.position2.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-40), player.Be.position4 = player.Be.position4.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-40), player.Be.position6 = player.Be.position6.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-40), player.Be.position8 = player.Be.position8.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-40), player.Be.position10 = player.Be.position10.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-40), player.Be.position12 = player.Be.position12.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-40), player.Be.position14 = player.Be.position14.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-40), player.Be.position16 = player.Be.position16.times(0).add(-660)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-40), player.Be.position18 = player.Be.position18.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-40), player.Be.position20 = player.Be.position20.times(0).add(-540)
            },
        },
        24: {
            style() {if (temp['Be'].clickables[24].canClick == true) return {color: "#A49B8A", 'background-color': '#303338', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Lipperhey",
            display() { if (temp['Be'].clickables[24].canClick == true) return '"Smaller Jupiter"'
                        else return 'Must have 5 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(5)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-160), player.Be.position2 = player.Be.position2.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-160), player.Be.position4 = player.Be.position4.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-160), player.Be.position6 = player.Be.position6.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-160), player.Be.position8 = player.Be.position8.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-160), player.Be.position10 = player.Be.position10.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-160), player.Be.position12 = player.Be.position12.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-160), player.Be.position14 = player.Be.position14.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-160), player.Be.position16 = player.Be.position16.times(0).add(-660)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-160), player.Be.position18 = player.Be.position18.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-160), player.Be.position20 = player.Be.position20.times(0).add(-540)
            },
        },
        25: {
            style() {if (temp['Be'].clickables[25].canClick == true) return {color: "#641112", 'background-color': '#1B1517', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Janssen",
            display() { if (temp['Be'].clickables[25].canClick == true) return '"Hell on Earth"'
                        else return 'Must have 5 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(5)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-280), player.Be.position2 = player.Be.position2.times(0).add(-1100)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-280), player.Be.position4 = player.Be.position4.times(0).add(-1040)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-280), player.Be.position6 = player.Be.position6.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-280), player.Be.position8 = player.Be.position8.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-280), player.Be.position10 = player.Be.position10.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-280), player.Be.position12 = player.Be.position12.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-280), player.Be.position14 = player.Be.position14.times(0).add(-720)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-280), player.Be.position16 = player.Be.position16.times(0).add(-660)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-280), player.Be.position18 = player.Be.position18.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-280), player.Be.position20 = player.Be.position20.times(0).add(-540)
            },
        },
        31: {
            style() {if (temp['Be'].clickables[31].canClick == true) return {color: "#ededed", 'background-color': '#DD8518', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "The Sun",
            display() { if (temp['Be'].clickables[31].canClick == true) return '"Luminary"'
                        else return 'Must have 3 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(3)) return true
                else return false
             },
             onClick() { 
                             if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(200), player.Be.position2 = player.Be.position2.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(200), player.Be.position4 = player.Be.position4.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(200), player.Be.position6 = player.Be.position6.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(200), player.Be.position8 = player.Be.position8.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(200), player.Be.position10 = player.Be.position10.times(0).add(-740)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(200), player.Be.position12 = player.Be.position12.times(0).add(-680)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(200), player.Be.position14 = player.Be.position14.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(200), player.Be.position16 = player.Be.position16.times(0).add(-540)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(200), player.Be.position18 = player.Be.position18.times(0).add(-480)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(200), player.Be.position20 = player.Be.position20.times(0).add(-420)
            },
        },
        32: {
            style() {if (temp['Be'].clickables[32].canClick == true) return {color: "#E6CFA7", 'background-color': '#A69DA0', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Saturn",
            display() { if (temp['Be'].clickables[32].canClick == true) return '"Ringed Planet"'
                        else return 'Must have 3 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(3)) return true
                else return false
             },
             onClick() { 
                             if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-280), player.Be.position2 = player.Be.position2.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(80), player.Be.position4 = player.Be.position4.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(80), player.Be.position6 = player.Be.position6.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(80), player.Be.position8 = player.Be.position8.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(80), player.Be.position10 = player.Be.position10.times(0).add(-740)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(80), player.Be.position12 = player.Be.position12.times(0).add(-680)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(80), player.Be.position14 = player.Be.position14.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(80), player.Be.position16 = player.Be.position16.times(0).add(-540)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(80), player.Be.position18 = player.Be.position18.times(0).add(-480)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(80), player.Be.position20 = player.Be.position20.times(0).add(-420)
            },
        },
        33: {
            style() {if (temp['Be'].clickables[33].canClick == true) return {color: "#CBAE8C", 'background-color': '#3E120B', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Pluto",
            display() { if (temp['Be'].clickables[33].canClick == true) return '"Dwarf Planet"'
                        else return 'Must have 3 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(3)) return true
                else return false
             },
             onClick() { 
                 if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-40), player.Be.position2 = player.Be.position2.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-40), player.Be.position4 = player.Be.position4.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-40), player.Be.position6 = player.Be.position6.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-40), player.Be.position8 = player.Be.position8.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-40), player.Be.position10 = player.Be.position10.times(0).add(-740)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-40), player.Be.position12 = player.Be.position12.times(0).add(-680)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-40), player.Be.position14 = player.Be.position14.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-40), player.Be.position16 = player.Be.position16.times(0).add(-540)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-40), player.Be.position18 = player.Be.position18.times(0).add(-480)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-40), player.Be.position20 = player.Be.position20.times(0).add(-420)
            },
        },
        34: {
            style() {if (temp['Be'].clickables[34].canClick == true) return {color: "#224E57", 'background-color': '#A6F1F4', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Uranus",
            display() { if (temp['Be'].clickables[34].canClick == true) return '"Ice Giant"'
                        else return 'Must have 3 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(3)) return true
                else return false
             },
             onClick() { 
                            if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-160), player.Be.position2 = player.Be.position2.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-160), player.Be.position4 = player.Be.position4.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-160), player.Be.position6 = player.Be.position6.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-160), player.Be.position8 = player.Be.position8.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-160), player.Be.position10 = player.Be.position10.times(0).add(-740)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-160), player.Be.position12 = player.Be.position12.times(0).add(-680)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-160), player.Be.position14 = player.Be.position14.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-160), player.Be.position16 = player.Be.position16.times(0).add(-540)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-160), player.Be.position18 = player.Be.position18.times(0).add(-480)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-160), player.Be.position20 = player.Be.position20.times(0).add(-420)
            },
        },
        35: {
            style() {if (temp['Be'].clickables[35].canClick == true) return {color: "#ededed", 'background-color': '#007E91', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Neptune",
            display() { if (temp['Be'].clickables[35].canClick == true) return '"The Big Blue"'
                        else return 'Must have 3 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(3)) return true
                else return false
             },
             onClick() { 
                 if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-280), player.Be.position2 = player.Be.position2.times(0).add(-980)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-280), player.Be.position4 = player.Be.position4.times(0).add(-920)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-280), player.Be.position6 = player.Be.position6.times(0).add(-860)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-280), player.Be.position8 = player.Be.position8.times(0).add(-800)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-280), player.Be.position10 = player.Be.position10.times(0).add(-740)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-280), player.Be.position12 = player.Be.position12.times(0).add(-680)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-280), player.Be.position14 = player.Be.position14.times(0).add(-600)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-280), player.Be.position16 = player.Be.position16.times(0).add(-540)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-280), player.Be.position18 = player.Be.position18.times(0).add(-480)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-280), player.Be.position20 = player.Be.position20.times(0).add(-420)
            },
        },
        41: {
            style() {if (temp['Be'].clickables[41].canClick == true) return {color: "#ecd67e", 'background-color': '#763E0F', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Mercury",
            display() { if (temp['Be'].clickables[41].canClick == true) return '"Swift Planet"'
                        else return 'Must have 2 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(2)) return true
                else return false
             },
             onClick() { 
               if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(200), player.Be.position2 = player.Be.position2.times(0).add(-870)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(200), player.Be.position4 = player.Be.position4.times(0).add(-810)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(200), player.Be.position6 = player.Be.position6.times(0).add(-750)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(200), player.Be.position8 = player.Be.position8.times(0).add(-685)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(200), player.Be.position10 = player.Be.position10.times(0).add(-620)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(200), player.Be.position12 = player.Be.position12.times(0).add(-555)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(200), player.Be.position14 = player.Be.position14.times(0).add(-490)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(200), player.Be.position16 = player.Be.position16.times(0).add(-425)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(200), player.Be.position18 = player.Be.position18.times(0).add(-360)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(200), player.Be.position20 = player.Be.position20.times(0).add(-300)
            },
        },
        42: {
            style() {if (temp['Be'].clickables[42].canClick == true) return {color: "#FFC649", 'background-color': '#ff4d01', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Venus",
            display() { if (temp['Be'].clickables[42].canClick == true) return '"Morning Star and Evening Star"'
                        else return 'Must have 2 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(2)) return true
                else return false
             },
             onClick() { 
                 if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(80), player.Be.position2 = player.Be.position2.times(0).add(-870)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(80), player.Be.position4 = player.Be.position4.times(0).add(-810)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(80), player.Be.position6 = player.Be.position6.times(0).add(-750)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(80), player.Be.position8 = player.Be.position8.times(0).add(-685)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(80), player.Be.position10 = player.Be.position10.times(0).add(-620)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(80), player.Be.position12 = player.Be.position12.times(0).add(-555)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(80), player.Be.position14 = player.Be.position14.times(0).add(-490)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(80), player.Be.position16 = player.Be.position16.times(0).add(-425)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(80), player.Be.position18 = player.Be.position18.times(0).add(-360)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(80), player.Be.position20 = player.Be.position20.times(0).add(-300)
            },
        },
        43: {
            style() {if (temp['Be'].clickables[43].canClick == true) return {color: "#F4F6F0", 'background-color': '#63666A', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "The Moon",
            display() { if (temp['Be'].clickables[43].canClick == true) return '"Once In A Blue Moon"'
                        else return 'Must have 1 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(1)) return true
                else return false
             },
             onClick() {
                 if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-40), player.Be.position2 = player.Be.position2.times(0).add(-870)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-40), player.Be.position4 = player.Be.position4.times(0).add(-810)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-40), player.Be.position6 = player.Be.position6.times(0).add(-750)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-40), player.Be.position8 = player.Be.position8.times(0).add(-685)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-40), player.Be.position10 = player.Be.position10.times(0).add(-620)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-40), player.Be.position12 = player.Be.position12.times(0).add(-555)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-40), player.Be.position14 = player.Be.position14.times(0).add(-490)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-40), player.Be.position16 = player.Be.position16.times(0).add(-425)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-40), player.Be.position18 = player.Be.position18.times(0).add(-360)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-40), player.Be.position20 = player.Be.position20.times(0).add(-300)
            },
        },
        44: {
            style() {if (temp['Be'].clickables[44].canClick == true) return {color: "#f44336", 'background-color': '#9C2E35', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Mars",
            display() { if (temp['Be'].clickables[44].canClick == true) return '"Red Planet"'
                        else return 'Must have 2 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(2)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-160), player.Be.position2 = player.Be.position2.times(0).add(-870)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-160), player.Be.position4 = player.Be.position4.times(0).add(-810)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-160), player.Be.position6 = player.Be.position6.times(0).add(-750)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-160), player.Be.position8 = player.Be.position8.times(0).add(-685)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-160), player.Be.position10 = player.Be.position10.times(0).add(-620)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-160), player.Be.position12 = player.Be.position12.times(0).add(-555)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-160), player.Be.position14 = player.Be.position14.times(0).add(-490)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-160), player.Be.position16 = player.Be.position16.times(0).add(-425)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-160), player.Be.position18 = player.Be.position18.times(0).add(-360)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-160), player.Be.position20 = player.Be.position20.times(0).add(-300)
            },
        },
        45: {
            style() {if (temp['Be'].clickables[45].canClick == true) return {color: "#D39C7E", 'background-color': '#90614D', 'border-radius': '100%'}
                    else return {color: "#ededed", 'border-radius': '100%'}},
            title: "Jupiter",
            display() { if (temp['Be'].clickables[45].canClick == true) return '"Gas Giant"'
                        else return 'Must have 2 total rocketships to travel to.'},
            canClick() { if (player.Be.Rocketships.gte(2)) return true
                else return false
             },
             onClick() { 
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 1) return player.Be.s1 = player.Be.s1.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position1 = player.Be.position1.times(0).add(-280), player.Be.position2 = player.Be.position2.times(0).add(-870)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 2) return player.Be.s2 = player.Be.s2.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position3 = player.Be.position3.times(0).add(-280), player.Be.position4 = player.Be.position4.times(0).add(-810)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 3) return player.Be.s3 = player.Be.s3.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position5 = player.Be.position5.times(0).add(-280), player.Be.position6 = player.Be.position6.times(0).add(-750)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 4) return player.Be.s4 = player.Be.s4.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position7 = player.Be.position7.times(0).add(-280), player.Be.position8 = player.Be.position8.times(0).add(-685)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 5) return player.Be.s5 = player.Be.s5.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position9 = player.Be.position9.times(0).add(-280), player.Be.position10 = player.Be.position10.times(0).add(-620)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 6) return player.Be.s6 = player.Be.s6.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position11 = player.Be.position11.times(0).add(-280), player.Be.position12 = player.Be.position12.times(0).add(-555)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 7) return player.Be.s7 = player.Be.s7.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position13 = player.Be.position13.times(0).add(-280), player.Be.position14 = player.Be.position14.times(0).add(-490)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 8) return player.Be.s8 = player.Be.s8.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position15 = player.Be.position15.times(0).add(-280), player.Be.position16 = player.Be.position16.times(0).add(-425)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 9) return player.Be.s9 = player.Be.s9.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position17 = player.Be.position17.times(0).add(-280), player.Be.position18 = player.Be.position18.times(0).add(-360)
                if (player.Be.s1 != this.id && player.Be.s2 != this.id && player.Be.s3 != this.id && player.Be.s4 != this.id && player.Be.s5 != this.id && player.Be.s6 != this.id && player.Be.s7 != this.id && player.Be.s8 != this.id && player.Be.s9 != this.id && player.Be.s10 != this.id && player.Be.Activeships == 10) return player.Be.s10 = player.Be.s10.times(0).add(this.id), player.Be.Activeships = player.Be.Activeships.sub(1), player.Be.position19 = player.Be.position19.times(0).add(-280), player.Be.position20 = player.Be.position20.times(0).add(-300)
            },
        },
        51: {
            style() {return {color: "#287AB8", 'background-color': '#223b05', 'border-radius': '100%'}},
            title: "Earth",
            display() { return `"Home"`},
            canClick() { return true},
            branches: [43]
        },
        52: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Mercury",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(3)) return [61]} 
        },
        53: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Venus",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(3)) return [62]} 
        },
        54: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "The Moon",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(5)) return [71, 72, 73, 74, 75]}
        },
        55: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Mars",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(3)) return [64]} 
        },
        56: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Jupiter",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(3)) return [65]} 
        },
        61: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "The Sun",
            canClick() { return false},
            branches() { 
                if (player.Be.Rocketships.gte(5)) return [63, 71]
                if (player.Be.Rocketships.gte(3)) return [63]
            } 
        },
        62: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Saturn",
            canClick() { return false},
            branches() { 
                if (player.Be.Rocketships.gte(5)) return [63, 73]
                if (player.Be.Rocketships.gte(3)) return [63]
            } 
        },
        63: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Pluto",
            canClick() { return false},
            branches() { 
                if (player.Be.Rocketships.gte(5)) return [63, 71, 72, 73, 74, 75]
                if (player.Be.Rocketships.gte(3)) return [63]
            } 
        },
        64: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Uranus",
            canClick() { return false},
            branches() { 
                if (player.Be.Rocketships.gte(5)) return [63, 74]
                if (player.Be.Rocketships.gte(3)) return [63]
            } 
        },
        65: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Neptune",
            canClick() { return false},
            branches() { 
                if (player.Be.Rocketships.gte(5)) return [63, 72]
                if (player.Be.Rocketships.gte(3)) return [63]
            } 
        },
        71: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "55 Cancri A",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        72: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Galileo",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        73: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Brahe",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        74: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Lipperhey",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        75: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Janssen",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        81: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Planet gwa",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        82: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Death Star",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        83: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "MultiOrb",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        84: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Genviron",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        85: {
            style() {return {color: "#ededed", 'background-color': '#78BF5F', 'border-radius': '100%'}},
            title: "Haumea",
            canClick() { return false},
            branches() { if (player.Be.Rocketships.gte(10)) return [83]} 
        },
        91: {
            style: {color: "#ededed", 'background-color': '#78BF5F'},
            title: "Throw All Beryllium Scrap Back In The Dumpster",
            canClick() {
                return true
            },
            onClick() { return player.Be.points = player.Be.points.times(0)},
        },
        92: {
            style: {color: "#ededed"},
            title: "Put all your rocketships on standby.",
            canClick() {
                if (player.Be.Activeships != player.Be.Rocketships) return true
                else return false
            },
            onClick() { 
                return player.Be.Activeships = player.Be.Rocketships, player.Be.s1 = player.Be.s1.times(0), player.Be.s2 = player.Be.s2.times(0), player.Be.s3 = player.Be.s3.times(0), player.Be.s4 = player.Be.s4.times(0), player.Be.s5 = player.Be.s5.times(0), player.Be.s6 = player.Be.s6.times(0), player.Be.s7 = player.Be.s7.times(0), player.Be.s8 = player.Be.s8.times(0), player.Be.s9 = player.Be.s9.times(0), player.Be.s10 = player.Be.s10.times(0)},
        },
        93: {
            style: {color: "#ededed"},
            title: "Reset Tier 1 Resources.",
            canClick() {
               return true
            },
            onClick() { 
                return player.Be.metalliccore = player.Be.metalliccore.times(0), player.Be.sulfuricAcid = player.Be.sulfuricAcid.times(0), player.Be.basaltrock = player.Be.basaltrock.times(0), player.Be.jupiterHelium = player.Be.jupiterHelium.times(0)}
        },
    },

    buyables: {
        11: {
            style: {color: "#ededed"},
            cost() { 
                if (hasUpgrade('Be', 31)) return new Decimal(0)
                else return player.Be.Stored.add(player.Be.Current)},
            display() { return "<div> Convert Beryllium Scraps to Plates using a Industrial Beryllium Plate Rolling Machine.<div> Cost: " + formatWhole(this.cost()) + " Scraps of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { return player[this.layer].points.gte(this.cost())},
            purchaseLimit: 50,
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
                player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1)
                player.Be.Stored1 = player.Be.Current
                player.Be.Current = player.Be.Current.add(player.Be.Stored)
                player.Be.Stored = player.Be.Stored1
            },
        },
        12: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            cost() { return new Decimal(1)},
            display() { if (getBuyableAmount(this.layer, 15) > 0) return 'Must have 0 fuel tanks to buy.'
                else return "<div> Get an engine nozzle.<div> 10% more mining speed per nozzle. Cap at 101.<div> Cost: " + formatWhole(this.cost()) + " Plates of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { if (getBuyableAmount(this.layer, 15) > 0) return ''
                else return player[this.layer].BerylliumPlates.gte(this.cost()) },
            purchaseLimit: 10,
            buy() {
                player[this.layer].BerylliumPlates = player[this.layer].BerylliumPlates.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.Sped = player.Li.Sped.times(1.1)
                if (player.Li.Sped.gte(101)) player.Li.Sped = player.Li.Sped.times(0).add(101)
            },
            sellOne() { if (getBuyableAmount(this.layer, this.id) > 0 && getBuyableAmount(this.layer, 15) == 0 && hasMilestone('Be', 2) == false) return player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1)), player.Li.Sped = player.Li.Sped.div(1.1)},
        },
        13: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            cost() { return new Decimal(1)},
            display() { if (getBuyableAmount(this.layer, 15) > 0) return 'Must have 0 fuel tanks to buy.'
                else return "<div> Get a fin.<div> 1% increased chance to get Lithium from Lepoidolite per fin.<div> Cost: " + formatWhole(this.cost()) + " Plates of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { if (getBuyableAmount(this.layer, 15) > 0) return ''
                else return player[this.layer].BerylliumPlates.gte(this.cost()) },
            purchaseLimit: 10,
            buy() {
                player[this.layer].BerylliumPlates = player[this.layer].BerylliumPlates.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Li.Li1 = player.Li.Li1.add(1), player.Li.H1 = player.Li.H1.add(1)
            },
            sellOne() { if (getBuyableAmount(this.layer, this.id) > 0 && getBuyableAmount(this.layer, 15) == 0 && hasMilestone('Be', 2) == false) return player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1)), player.Li.Li1 = player.Li.Li1.sub(1), player.Li.H1 = player.Li.H1.sub(1)},
        },
        14: { 
            style: {width: '125px', height: '120px', color: "#ededed"},
            cost() { return new Decimal(1)},
            display() { return "<div> Get a foward seperation rocket.<div> 30x more Lithium from Lepoidolite per rocket.<div> Cost: " + formatWhole(this.cost()) + " Plates of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { return player[this.layer].BerylliumPlates.gte(this.cost()) },
            purchaseLimit: 10,
            buy() {
                player[this.layer].BerylliumPlates = player[this.layer].BerylliumPlates.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Be.LB = player.Be.LB.add(30)
            },
            sellOne() { if (getBuyableAmount(this.layer, this.id) > 0 && hasMilestone('Be', 2) == false) return player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1)), player.Be.LB = player.Be.LB.sub(30).add(1)
                if(getBuyableAmount(this.layer, this.id) == 0) return player.Be.LB = player.Be.LB.times(0).add(1)},
        },
        15: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            cost() { return new Decimal(1)},
            display() { return "<div> Get a fuel tank.<div> Boosts Lithium from Lepoidolite based on total amount of the nozzles and fins per tank.<div> Currently: x" + formatWhole(getBuyableAmount(this.layer, 12).times(10).add(getBuyableAmount(this.layer, 13).times(10)).times(getBuyableAmount(this.layer, this.id))) + "<div> Cost: " + formatWhole(this.cost()) + " Plates of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { return player[this.layer].BerylliumPlates.gte(this.cost()) },
            purchaseLimit: 10,
            buy() {
                player[this.layer].BerylliumPlates = player[this.layer].BerylliumPlates.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Be.LB2 = player.Be.LB2.add(getBuyableAmount(this.layer, 12).times(10).add(getBuyableAmount(this.layer, 13).times(10)))
            },
            sellOne() { 
                if (getBuyableAmount(this.layer, this.id) > 0 && hasMilestone('Be', 2) == false) return player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1)), player.Be.LB2 = player.Be.LB2.sub(getBuyableAmount(this.layer, 12).times(10).add(getBuyableAmount(this.layer, 13).times(10)))
                if (getBuyableAmount(this.layer, this.id) == 0) return player.Be.LB2 = player.Be.LB2.times(0).add(1)},
        },
        16: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            cost() { return new Decimal(1)},
            display() { return "<div> Get an outer casing.<div> Gain 1 more Beryllium scrap per casing on reset.<div> Cost: " + formatWhole(this.cost()) + " Plates of Beryllium<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))},
            canAfford() { return player[this.layer].BerylliumPlates.gte(this.cost()) },
            purchaseLimit: 10,
            buy() {
                player[this.layer].BerylliumPlates = player[this.layer].BerylliumPlates.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Be.Badd = player.Be.Badd.add(1)
            },
            sellOne() { if (getBuyableAmount(this.layer, this.id) > 0 && hasMilestone('Be', 2) == false) return player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(1), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1)), player.Be.Badd = player.Be.Badd.sub(1)},
        },
        21: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            display() { 
                if (getBuyableAmount(this.layer, this.id) == 0) return "<div> Make a rocketship.<div> Cost: All Rocketship Parts<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 1) return "<div> Make another rocketship.<div> Cost: 1000 Liters Liquid Molten Iron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 2) return "<div> Make another rocketship.<div> Cost: 25 Metallic Cores, 100 Liters of Sulfuric Acid, 1000 Liters of Molten Liquid Iron, 30 Liters of Helium and 150 Basalt Rocks.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 3) return "<div> Make another rocketship.<div> Cost: 6 Solar Bars, 10 Liters of Methane Gas, 15 Liters of Ammonia, 5 Slush.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 4) return "<div> Make another rocketship.<div> Cost: 3 Grams of Plutonium.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 5) return "<div> Make another rocketship.<div> Cost: 1 Light.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 6) return "<div> Make another rocketship.<div> Cost: 1 Liter of Helium Hydride.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 7) return "<div> Make another rocketship.<div> Cost: 1 Unkown.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 8) return "<div> Make another rocketship.<div> Cost: 1 Water Cloud.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 9) return "<div> Make another rocketship.<div> Cost: 1 Diamond.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
                if (getBuyableAmount(this.layer, this.id) == 10) return "<div> Max rocketships reached.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
               },
            canAfford() { 
                if (getBuyableAmount(this.layer, this.id) == 0) return new Decimal(0)
                if (getBuyableAmount(this.layer, this.id) == 1) return player[this.layer].moltenIron.gte(1000)
                if (getBuyableAmount(this.layer, this.id) == 2) return player[this.layer].moltenIron.gte(1000) && player[this.layer].metalliccore.gte(25) && player[this.layer].sulfuricAcid.gte(100) && player[this.layer].jupiterHelium.gte(30) && player[this.layer].basaltrock.gte(150)
                if (getBuyableAmount(this.layer, this.id) == 3) return player[this.layer].solarBar.gte(6) && player[this.layer].methaneGas.gte(10) && player[this.layer].uranusAmmonia.gte(15) && player[this.layer].neptuneSlush.gte(5)
                if (getBuyableAmount(this.layer, this.id) == 4) return player[this.layer].plutonium.gte(3)
                if (getBuyableAmount(this.layer, this.id) == 5) return player[this.layer].ALight.gte(1)
                if (getBuyableAmount(this.layer, this.id) == 6) return player[this.layer].gHeliumHydride.gte(1)
                if (getBuyableAmount(this.layer, this.id) == 7) return player[this.layer].bunknown.gte(1)
                if (getBuyableAmount(this.layer, this.id) == 8) return player[this.layer].lWaterCloud.gte(1)
                if (getBuyableAmount(this.layer, this.id) == 9) return player[this.layer].jDiamond.gte(1)
                },
            purchaseLimit: 10,
            buy() {
                if (getBuyableAmount(this.layer, this.id) == 1) player[this.layer].moltenIron = player[this.layer].moltenIron.sub(1000)
                if (getBuyableAmount(this.layer, this.id) == 2) player[this.layer].moltenIron = player[this.layer].moltenIron.sub(1000), player[this.layer].metalliccore = player[this.layer].metalliccore.sub(25), player[this.layer].sulfuricAcid = player[this.layer].sulfuricAcid.sub(100), player[this.layer].jupiterHelium = player[this.layer].jupiterHelium.sub(30), player[this.layer].basaltrock = player[this.layer].basaltrock.sub(150)
                if (getBuyableAmount(this.layer, this.id) == 3) player[this.layer].solarBar = player[this.layer].solarBar.sub(6), player[this.layer].methaneGas = player[this.layer].methaneGas.sub(10), player[this.layer].uranusAmmonia = player[this.layer].uranusAmmonia.sub(15), player[this.layer].neptuneSlush = player[this.layer].neptuneSlush.sub(5)
                if (getBuyableAmount(this.layer, this.id) == 4) player[this.layer].plutonium = player[this.layer].plutonium.sub(3)
                if (getBuyableAmount(this.layer, this.id) == 5) player[this.layer].ALight = player[this.layer].ALight.sub(1)
                if (getBuyableAmount(this.layer, this.id) == 6) player[this.layer].gHeliumHydride = player[this.layer].gHeliumHydride.sub(1)
                if (getBuyableAmount(this.layer, this.id) == 7) player[this.layer].bunknown = player[this.layer].bunknown.sub(1)
                if (getBuyableAmount(this.layer, this.id) == 8) player[this.layer].lWaterCloud = player[this.layer].lWaterCloud.sub(1)
                if (getBuyableAmount(this.layer, this.id) == 9) player[this.layer].jDiamond = player[this.layer].jDiamond.sub(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.Be.Rocketships = player.Be.Rocketships.add(1), player.Be.s1 = player.Be.s1.times(0), player.Be.s2 = player.Be.s2.times(0), player.Be.s3 = player.Be.s3.times(0), player.Be.s4 = player.Be.s4.times(0), player.Be.s5 = player.Be.s5.times(0), player.Be.s6 = player.Be.s6.times(0), player.Be.s7 = player.Be.s7.times(0), player.Be.s8 = player.Be.s8.times(0), player.Be.s9 = player.Be.s9.times(0), player.Be.s10 = player.Be.s10.times(0), player.Be.Activeships = player.Be.Rocketships                },
        },
    },

    prestigeButtonText() { return 'Reset for +' + formatWhole(player.Be.Badd.add(1)) + ' Beryllium Scraps<div><div>Req: ' + format(player.Li.points) + ' / ' + format(tmp.Be.nextAtDisp)},

    infoboxes: {
        lore: {
            titleStyle: { "color": "#ededed" },
            title: "Beryllium",
            body() { return "Uh-oh, seems like society has turned against you. Luckily, Beryllium has many properties that makes it great for manufacturing space craft. First and foremost, ya gotta build the rocketship. (Also it's important to note that layers only reset other layers that are to the left of them.)" },
        },
        lore1: {
            titleStyle: { "color": "#ededed" },
            title: "Le Universe",
            body() { return "Damn, you actually managed to get all those rocketship parts. Sadly, that's not the end. Ya gotta go over to the next tab and go build more rocketship's my man! This tab is just for a visiual aid anyway. Go uh, go colonize some planets or something, you're good at that right?" },
        },
        lore2: {
            titleStyle: { "color": "#ededed" },
            title: "Beryllium",
            body() { return "Oh shit, seems like society has turned against you. Luckily, Beryllium has many properties that makes it great for manufacturing space craft. First and foremost, ya gotta build the rocketship. (Also it's important to note that layers only reset other layers that are to the left of them.)" },
        },
    },

componentStyles: {
    "prestige-button"() { return {color: "#ededed"}}
},

    tabFormat: {
        "MainTab": {
            content: [
                () => (options.matureMode == false) ? ['infobox', 'lore'] : ['infobox', 'lore2'],
                "main-display",
                () => (hasMilestone('Be', 2)) ? "" : "prestige-button",
                "blank",
                ['display-text',
            function() { if (player.p.Node < 1) return 'You have ' + format(player.Li.points) + ' Lithium'}],
                "blank",
                'milestones',
                ['display-text',
                function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.Be.BerylliumPlates) + ' Beryllium Plates'}],
                "blank",
                ['buyable', 11],
                ["row", [
                    ['upgrade', 31],
                    ['clickable', 91], 
                ]],
                ["row", [
                    ['upgrade', 21],
                    ['upgrade', 22],
                ]],
                ["row", [
                    ['upgrade', 11],
                    ['upgrade', 12],
                    "blank",
                    "blank",
                    "blank",
                    ['upgrade', 13],
                    "blank",
                    "blank",
                    "blank",
                    ['upgrade', 14],
                    ['upgrade', 15],
                ]],
                ["row", [
                    ['buyable', 12],
                    ['buyable', 13],
                    "blank",
                    "blank",
                    "blank",
                    ['buyable', 14],
                    "blank",
                    "blank",
                    "blank",
                    ['buyable', 15],
                    ['buyable', 16],
                ]],
            ],
        },
        "Map": {
            content: [
                ["infobox", "lore1"],
                "blank",
                ["row", [ //1
                ['clickable', 81], 
                "blank",
                ['clickable', 82],
                "blank", 
                ['clickable', 83], 
                "blank",
                ['clickable', 84],
                "blank",
                ['clickable', 85],  
                ]],
                "blank",
                "blank",
                ["row", [ //2
                ['clickable', 71], 
                "blank",
                ['clickable', 72], 
                "blank",
                ['clickable', 73],
                "blank", 
                ['clickable', 74],
                "blank",
                ['clickable', 75],  
                ]],
                "blank",
                "blank",
                ["row", [ //3
                ['clickable', 61], 
                "blank",
                ['clickable', 62], 
                "blank",
                ['clickable', 63], 
                "blank",
                ['clickable', 64],
                "blank",
                ['clickable', 65],  
                ]],
                "blank",
                "blank",
                ["row", [ //4
                ['clickable', 52], 
                "blank",
                ['clickable', 53], 
                "blank",
                ['clickable', 54], 
                "blank",
                ['clickable', 55],
                "blank",
                ['clickable', 56],  
                ]],
            ],
            unlocked() { if (hasMilestone('Be', 2)) return true
            else return false}
        },
        "Le Universe": {
            content: [
                ["row", [ //1
                ['display-text',
                function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.Be.Activeships) + ' / ' + formatWhole(player.Be.Rocketships) + ' rocketships on standby.'}],
                "blank",
                ['buyable', 21],
                ['clickable', 92],
                ['clickable', 93],
                ]],
            "blank",
                ["row", [ //1
                ['clickable', 11], 
                ['clickable', 12], 
                ['clickable', 13], 
                ['clickable', 14],
                ['clickable', 15],  
                ]],
                ["row", [ //2
                ['clickable', 21], 
                ['clickable', 22], 
                ['clickable', 23], 
                ['clickable', 24],
                ['clickable', 25],  
                ]],
                ["row", [ //3
                ['clickable', 31], 
                ['clickable', 32], 
                ['clickable', 33], 
                ['clickable', 34],
                ['clickable', 35],  
                ]],
                ["row", [ //4
                ['clickable', 41], 
                ['clickable', 42], 
                ['clickable', 43], 
                ['clickable', 44],
                ['clickable', 45],  
                ]],
                "blank",
                "blank",
                ['clickable', 51], 
                ["row", function () {
                    if (player.Be.s10 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position19}px`, top: `${player.Be.position20}px`, id: 'top', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s9 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position17}px`, top: `${player.Be.position18}px`, id: 'top', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s8 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position15}px`, top: `${player.Be.position16}px`, id: 'top', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s7 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position13}px`, top: `${player.Be.position14}px`, id: 'top', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s6 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position11}px`, top: `${player.Be.position12}px`, id: 'top', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s5 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position9}px`, top: `${player.Be.position10}px`, id: 'top,', 'z-index': '2'}],
                ]}],
                ["row", function () {
                    if (player.Be.s4 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position7}px`, top: `${player.Be.position8}px`, id: 'top', 'z-index': '2'}],
                ]}],  
                ["row", function () {
                        if (player.Be.s3 > 0) return [
                            ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position5}px`, top: `${player.Be.position6}px`, id: 'top', 'z-index': '2'}],
                    ]}],
                ["row", function () {
                    if (player.Be.s2 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position3}px`, top: `${player.Be.position4}px`, id: 'top', 'z-index': '2'}],
                    ]}],
                ["row", function () {
                    if (player.Be.s1 > 0) return [
                        ["display-image", 'https://i.postimg.cc/7hTxMWD0/E6vgz-TBWEAYa-M3r-prev-ui.png', { height: `60px`, width: `100px`, position: 'relative',  right: `${player.Be.position1}px`, top: `${player.Be.position2}px`, id: 'top', 'z-index': '2'}],
                    ]}],
            ],  
            unlocked() { if (hasMilestone('Be', 2)) return true
            else return false}
        },
        "Resources": {
            content: [
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(1)) return '<u>The Moon</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(1)) return 'You have ' + formatWhole(player.Be.moonDust) + ' Moon Dust.<div> 10 || ' + formatWhole((new Decimal(3).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(1)) return 'You have ' + formatWhole(player.Be.moltenIron) + 'L of Molten Liquid Iron.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(1)) return [
                    ["display-image", 'https://i.postimg.cc/W16mJYFy/moon-16mar2014-stretched-prev-ui.png', { width: '100px', position: 'absolute',  right: '100px', top: '100px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return '<u>Mercury</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.mercuryDust) + ' Mercury Dust.<div> 100 || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.metalliccore) + ' Metallic Cores.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return [
                    ["display-image", 'https://i.postimg.cc/fWGLXxdn/mercury-4-prev-ui.png', { width: '100px', position: 'absolute',  right: '100px', top: '190px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return '<u>Venus</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.venusDust) + ' Venus Dust.<div> 67 || ' + formatWhole((new Decimal(2).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.sulfuricAcid) + 'L of Sulfuric Acid.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return [
                    ["display-image", 'https://i.postimg.cc/W4SLnJ17/Venus-imaged-by-Magellan-prev-ui.png', { width: '75px', position: 'absolute',  right: '110px', top: '270px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return '<u>Mars</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.marsDust) + ' Mars Dust.<div> 40 || ' + formatWhole((new Decimal(8).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.basaltrock) + ' Basalt Rocks.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return [
                    ["display-image", 'https://i.postimg.cc/FsQvhv83/wp2305652-prev-ui.png', { width: '75px', position: 'absolute',  right: '103px', top: '360px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return '<u>Jupiter</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.jupiterHydrogen) + 'L of Hydrogen.<div> 90 || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return 'You have ' + formatWhole(player.Be.jupiterHelium) + 'L of Helium.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(2)) return [
                    ["display-image", 'https://i.postimg.cc/6qtM1Mb2/pd36-1-gsfc-20171208-archive-e000103-prev-ui.png', { width: '75px', position: 'absolute',  right: '110px', top: '430px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return '<u>The Sun</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.solarEssence) + ' Solar Essence.<div> 100 + 3 MC || ' + formatWhole((new Decimal(3).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.solarBar) + ' Solar Bars.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return [
                    ["display-image", 'https://i.postimg.cc/2jwsdfJd/photorealistic-sun-8k-textures-3d-model-3d-model-low-poly-obj-fbx-stl-blend-dae-gltf-prev-ui.png', { width: '200px', position: 'absolute',  right: '45px', top: '500px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return '<u>Saturn</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.saturnIce) + ' Ice.<div> 342 + 10 SA || ' + formatWhole((new Decimal(5).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.methaneGas) + 'L of Methane Gas.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return [
                    ["display-image", 'https://i.postimg.cc/6pNCBDWS/aa2f78effbe107f23b6e5a3aebd4d563-prev-ui.png', { width: '100px', position: 'absolute',  right: '100px', top: '610px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return '<u>Pluto</u>'}], 
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.plutoCarbon) + 'g of Carbon.<div> 10000 + 9 SB + 15L MG + 30L AG + 15 SL || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3) && options.mobileMode == false) return 'You have <h1 class="glow">' + formatWhole(player.Be.plutonium) + 'g of Plutonium</h1>.'
                if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.plutonium) + 'g of Plutonium.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return [
                    ["display-image", 'https://i.postimg.cc/HxxySMH4/207-pluto-large-1-prev-ui.png', { width: '120px', position: 'absolute',  right: '85px', top: '700px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return '<u>Uranus</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.uranusWater) + 'L of Water.<div> 1000 + 100 BR || 1' + formatWhole((new Decimal(10).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.uranusAmmonia) + 'L of Ammonia Gas.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return [
                    ["display-image", 'https://i.postimg.cc/P55vfZvG/uranus-1-j7yk16-prev-ui.png', { width: '100px', position: 'absolute',  right: '95px', top: '780px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return '<u>Neptune</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.neptuneCloud) + ' Clouds.<div> 50 + 5L He || ' + formatWhole((new Decimal(3).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'You have ' + formatWhole(player.Be.neptuneSlush) + ' Slush.'}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return [
                    ["display-image", 'https://i.postimg.cc/HWJgmLkS/image-prev-ui.png', { width: '100px', position: 'absolute',  right: '100px', top: '860px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return '<u>55 Cancri A</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'Conversion: 312 MLI + 1g PL + 5321 SE || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5) && options.mobileMode == false) return 'You have <h1 class="glow2">' + formatWhole(player.Be.ALight) + ' Light</h1> Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))
                if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'You have ' + formatWhole(player.Be.ALight) + ' Lights. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return [
                    ["display-image", 'https://i.postimg.cc/D0kgNSb8/th-1403826250-prev-ui.png', { width: '70px', position: 'absolute',  right: '110px', top: '930px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return '<u>Galileo</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'Conversion: 455 MLI + 1g PL + 2000 CL || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5) && options.mobileMode == false) return 'You have <h1 class="glow3">' + formatWhole(player.Be.gHeliumHydride) + 'L of Helium Hydride</h1>. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))
                if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'You have ' + formatWhole(player.Be.gHeliumHydride) + 'L of Helium Hydride. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return [
                    ["display-image", 'https://i.postimg.cc/05z3zSf1/290px-55cnc-C1-prev-ui.png', { width: '100px', position: 'absolute',  right: '90px', top: '1010px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return '<u>Brahe</u>'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'Conversion: 520 MLI + 1g PL + 21111 IC || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5) && options.mobileMode == false) return 'You have <h1 class="glow4">' + formatWhole(player.Be.bunknown) + ' Unknown</h1>. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))
                if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'You have ' + formatWhole(player.Be.bunknown) + ' Unkown. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
                ["row", function () {
                    if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return [
                    ["display-image", 'https://i.postimg.cc/cCWsLcnZ/55cncb-prev-ui.png', { width: '100px', position: 'absolute',  right: '100px', top: '1080px', id: 'under'}],
               ]}],
               "blank",
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return '<u>Lipperhey</u>'}],
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'Conversion: 584 MLI + 1g PL + 11911L H2O || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5) && options.mobileMode == false) return 'You have <h1 class="glow5">' + formatWhole(player.Be.lWaterCloud) + ' Water Clouds</h1>. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))
               if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'You have ' + formatWhole(player.Be.lWaterCloud) + ' Water Clouds. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
               ["row", function () {
                   if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return [
                   ["display-image", 'https://i.postimg.cc/wjqQm8pR/3819005-orig-prev-ui.png', { width: '100px', position: 'absolute',  right: '96px', top: '1160px', id: 'under'}],
              ]}],
              "blank",
              ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return '<u>Janssen</u>'}],
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'Conversion: 666 MLI + 1g PL + 666666g CA || ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5) && options.mobileMode == false) return 'You have <h1 class="glow6">' + formatWhole(player.Be.jDiamond) + ' Diamonds</h1>. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))
               if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'You have ' + formatWhole(player.Be.jDiamond) + ' Diamonds. Max: ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}], 
               ["row", function () {
                   if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return [
                   ["display-image", 'https://i.postimg.cc/dtdxBKpW/D-prev-ui.png', { width: '100px', position: 'absolute',  right: '90px', top: '1240px', id: 'under'}],
              ]}],
              "blank",
              ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return '<u>Planet gwa</u>'}],
               ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'You have ' + formatWhole(player.Be.gwa) + ' gwa.<div> Making ' + formatWhole((new Decimal(231).times(player.B.points.add(1)))) + ' gwa/tick.'}],
               ["row", function () {
                   if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return [
                   ["display-image", 'https://i.postimg.cc/R0kG9kd0/slazzer-edit-image-removebg-preview.png', { width: '70px', position: 'absolute',  right: '100px', top: '1310px', id: 'under'}],
              ]}],
              "blank",
              ['display-text',
              function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return '<u>Death Star</u>'}],
              ['display-text',
              function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'You have ' + formatWhole(player.Be.laser) + ' Lasers.<div> Making ' + formatWhole((new Decimal(7777).times(player.B.points.add(1)))) + ' Lasers/tick.'}],
              ["row", function () {
                  if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return [
                  ["display-image", 'https://i.postimg.cc/mrB2qkfZ/eee-3-removebg-preview.png', { width: '100px', position: 'absolute',  right: '90px', top: '1375px', id: 'under'}],
             ]}],
             "blank",
             ['display-text',
             function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return '<u>MultiOrb</u>'}],
             ['display-text',
               function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'Conversion: 3g PL + 1 LI + 1L HeH + 1 UN + 1 WC + 1 DI + 1,000,000 gwa + 10,000,000 LA + 1e16 DR + 10,000 EG|| ' + formatWhole((new Decimal(1).times(player.B.points.add(1))))}],
             ['display-text',
             function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10) && options.mobileMode == false) return 'You have <h1 class="Rainbow2">' + formatWhole(player.Be.rainbownium) + ' Rainbownium</h1>.'
                          if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'You have ' + formatWhole(player.Be.rainbownium) + ' Rainbownium.'}],
             ["row", function () {
                 if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return [
                 ["display-image", 'https://i.postimg.cc/027nxkHK/bl881-removebg-preview.png', { width: '50px', position: 'absolute',  right: '110px', top: '1480px', id: 'under'}],
            ]}],
            "blank",
            ['display-text',
            function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return '<u>Genviron</u>'}],
            ['display-text',
            function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'You have ' + formatWhole(player.Be.dirt) + ' Dirt.<div> Making ' + formatWhole((new Decimal(1e12).times(player.B.points.add(1)))) + ' Dirt/tick.'}],
            ["row", function () {
                if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return [
                ["display-image", 'https://i.postimg.cc/W34YbBJL/Z3e-WNw-X-removebg-preview.pngg', { width: '70px', position: 'absolute',  right: '95px', top: '1540px', id: 'under'}],
           ]}],
           "blank",
           ['display-text',
           function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return '<u>Haumea</u>'}],
           ['display-text',
           function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'You have ' + formatWhole(player.Be.egg) + ' eggs.<div> Making ' + formatWhole((new Decimal(1).times(player.B.points.add(1)))) + ' Eggs/tick.'}],
           ["row", function () {
               if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return [
               ["display-image", 'https://i.postimg.cc/Jz255ssg/maxresdefault-4-removebg-preview.png', { width: '140px', position: 'absolute',  right: '70px', top: '1605px', id: 'under'}],
          ]}],
          "blank",
            ],  
            unlocked() { if (player.Be.Rocketships.gte(1) && hasMilestone('Be', 2)) return true
            else return false}
        },
        "Abbreviations": {
            content: [
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(3)) return 'MC = Metallic Core, SA = Sulfuric Acid, BR = Basalt Rock, He = Helium, SB = Solar Bar, MG = Methane Gas, AG = Ammonia Gas, SL = Slush.'}],
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(5)) return 'MLI = Molten Liquid Iron,  PL = Plutonium, SE = Solar Essence, CL = Cloud, IC = Ice, H2O = Water, CA = Carbon.'}], 
                ['display-text',
                function() { if (player.p.Node < 1 && player.Be.Rocketships.gte(10)) return 'LI = Light,  HeH = Helium Hydride, UN = Unkown, WC = Water Cloud, DI = Diamond, gwa = gwa, LA = Laser, DR = Dirt, EG = Egg.'}],   
            ],
            unlocked() { if (player.Be.Rocketships.gte(3)) return true
            else return false}
        },
    },

    automate() {
        if (player.Be.s1 == 11 || player.Be.s2 == 11 || player.Be.s3 == 11 || player.Be.s4 == 11 || player.Be.s5 == 11 || player.Be.s6 == 11 || player.Be.s7 == 11 || player.Be.s8 == 11 || player.Be.s9 == 11 || player.Be.s10 == 11 || player.B.resets > 15 && player.Be.auto) player.Be.gwa = player.Be.gwa.add(new Decimal(231).times(player.B.points.add(1)))
        if (player.Be.s1 == 12 || player.Be.s2 == 12 || player.Be.s3 == 12 || player.Be.s4 == 12 || player.Be.s5 == 12 || player.Be.s6 == 12 || player.Be.s7 == 12 || player.Be.s8 == 12 || player.Be.s9 == 12 || player.Be.s10 == 12 || player.B.resets > 16 && player.Be.auto) player.Be.laser = player.Be.laser.add(new Decimal(7777).times(player.B.points.add(1)))
        if (player.Be.s1 == 13 || player.Be.s2 == 13 || player.Be.s3 == 13 || player.Be.s4 == 13 || player.Be.s5 == 13 || player.Be.s6 == 13 || player.Be.s7 == 13 || player.Be.s8 == 13 || player.Be.s9 == 13 || player.Be.s10 == 13 || player.B.resets > 17 && player.Be.auto){
        if (player.Be.plutonium.gte(3) && player.Be.ALight.gte(1) && player.Be.gHeliumHydride.gte(1) && player.Be.bunknown.gte(1) && player.Be.lWaterCloud.gte(1) && player.Be.jDiamond.gte(1) && player.Be.gwa.gte(1000000) && player.Be.laser.gte(10000000) && player.Be.dirt.gte(1e16) && player.Be.egg.gte(10000)) player.Be.plutonium = player.Be.plutonium.sub(3), player.Be.ALight = player.Be.ALight.sub(1), player.Be.gHeliumHydride = player.Be.gHeliumHydride.sub(1), player.Be.bunknown = player.Be.bunknown.sub(1), player.Be.gHeliumHydride = player.Be.lWaterCloud.sub(1), player.Be.jDiamond = player.Be.jDiamond.sub(1), player.Be.gwa = player.Be.gwa.sub(1000000), player.Be.laser = player.Be.laser.sub(10000000), player.Be.dirt = player.Be.dirt.sub(1e16), player.Be.egg = player.Be.egg.sub(10000), player.Be.rainbownium = player.Be.rainbownium.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 14 || player.Be.s2 == 14 || player.Be.s3 == 14 || player.Be.s4 == 14 || player.Be.s5 == 14 || player.Be.s6 == 14 || player.Be.s7 == 14 || player.Be.s8 == 14 || player.Be.s9 == 14 || player.Be.s10 == 14 || player.B.resets > 18 && player.Be.auto) player.Be.dirt = player.Be.dirt.add(new Decimal(1e12).times(player.B.points.add(1)))
        if (player.Be.s1 == 15 || player.Be.s2 == 15 || player.Be.s3 == 15 || player.Be.s4 == 15 || player.Be.s5 == 15 || player.Be.s6 == 15 || player.Be.s7 == 15 || player.Be.s8 == 15 || player.Be.s9 == 15 || player.Be.s10 == 15 || player.B.resets > 19 && player.Be.auto) player.Be.egg = player.Be.egg.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.s1 == 21 || player.Be.s2 == 21 || player.Be.s3 == 21 || player.Be.s4 == 21 || player.Be.s5 == 21 || player.Be.s6 == 21 || player.Be.s7 == 21 || player.Be.s8 == 21 || player.Be.s9 == 21 || player.Be.s10 == 21 || player.B.resets > 10 && player.Be.auto){
        if (player.Be.moltenIron.gte(312) && player.Be.plutonium.gte(1) && player.Be.solarEssence.gte(5321) && player.Be.ALight < player.B.points.add(1)) player.Be.moltenIron = player.Be.moltenIron.sub(312), player.Be.plutonium = player.Be.plutonium.sub(1), player.Be.solarEssence = player.Be.solarEssence.sub(5321), player.Be.ALight = player.Be.ALight.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 22 || player.Be.s2 == 22 || player.Be.s3 == 22 || player.Be.s4 == 22 || player.Be.s5 == 22 || player.Be.s6 == 22 || player.Be.s7 == 22 || player.Be.s8 == 22 || player.Be.s9 == 22 || player.Be.s10 == 22 || player.B.resets > 11 && player.Be.auto){
        if (player.Be.moltenIron.gte(455) && player.Be.plutonium.gte(1) && player.Be.neptuneCloud.gte(2000) && player.Be.gHeliumHydride < player.B.points.add(1)) player.Be.moltenIron = player.Be.moltenIron.sub(455), player.Be.plutonium = player.Be.plutonium.sub(1), player.Be.neptuneCloud = player.Be.neptuneCloud.sub(2000), player.Be.gHeliumHydride = player.Be.gHeliumHydride.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 23 || player.Be.s2 == 23 || player.Be.s3 == 23 || player.Be.s4 == 23 || player.Be.s5 == 23 || player.Be.s6 == 23 || player.Be.s7 == 23 || player.Be.s8 == 23 || player.Be.s9 == 23 || player.Be.s10 == 23 || player.B.resets > 12 && player.Be.auto){
        if (player.Be.moltenIron.gte(520) && player.Be.plutonium.gte(1) && player.Be.saturnIce.gte(21111) && player.Be.bunknown < player.B.points.add(1)) player.Be.moltenIron = player.Be.moltenIron.sub(520), player.Be.plutonium = player.Be.plutonium.sub(1), player.Be.saturnIce = player.Be.saturnIce.sub(21111), player.Be.bunknown = player.Be.bunknown.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 24 || player.Be.s2 == 24 || player.Be.s3 == 24 || player.Be.s4 == 24 || player.Be.s5 == 24 || player.Be.s6 == 24 || player.Be.s7 == 24 || player.Be.s8 == 24 || player.Be.s9 == 24 || player.Be.s10 == 24 || player.B.resets > 13 && player.Be.auto){
        if (player.Be.moltenIron.gte(584) && player.Be.plutonium.gte(1) && player.Be.uranusWater.gte(11911) && player.Be.lWaterCloud < player.B.points.add(1)) player.Be.moltenIron = player.Be.moltenIron.sub(584), player.Be.plutonium = player.Be.plutonium.sub(1), player.Be.uranusWater = player.Be.uranusWater.sub(11911), player.Be.lWaterCloud = player.Be.lWaterCloud.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 25 || player.Be.s2 == 25 || player.Be.s3 == 25 || player.Be.s4 == 25 || player.Be.s5 == 25 || player.Be.s6 == 25 || player.Be.s7 == 25 || player.Be.s8 == 25 || player.Be.s9 == 25 || player.Be.s10 == 25 || player.B.resets > 14 && player.Be.auto){
        if (player.Be.moltenIron.gte(666) && player.Be.plutonium.gte(1) && player.Be.plutoCarbon.gte(666666) && player.Be.jDiamond < player.B.points.add(1)) player.Be.moltenIron = player.Be.moltenIron.sub(666), player.Be.plutonium = player.Be.plutonium.sub(1), player.Be.plutoCarbon = player.Be.plutoCarbon.sub(666666), player.Be.jDiamond = player.Be.jDiamond.add(new Decimal(1).times(player.B.points.add(1)))}
        if (player.Be.s1 == 31 || player.Be.s2 == 31 || player.Be.s3 == 31 || player.Be.s4 == 31 || player.Be.s5 == 31 || player.Be.s6 == 31 || player.Be.s7 == 31 || player.Be.s8 == 31 || player.Be.s9 == 31 || player.Be.s10 == 31 || player.B.resets > 5 && player.Be.auto) player.Be.solarEssence = player.Be.solarEssence.add(player.B.baseT2).add(new Decimal(3).times(player.B.points.add(1)))
        if (player.Be.metalliccore.gte(3) && player.Be.solarEssence.gte(100)) player.Be.metalliccore = player.Be.metalliccore.sub(3), player.Be.solarEssence = player.Be.solarEssence.sub(100), player.Be.solarBar = player.Be.solarBar.add(new Decimal(3).times(player.B.points.add(1)))
        if (player.Be.s1 == 32 || player.Be.s2 == 32 || player.Be.s3 == 32 || player.Be.s4 == 32 || player.Be.s5 == 32 || player.Be.s6 == 32 || player.Be.s7 == 32 || player.Be.s8 == 32 || player.Be.s9 == 32 || player.Be.s10 == 32 || player.B.resets > 6 && player.Be.auto) player.Be.saturnIce = player.Be.saturnIce.add(player.B.baseT2).add(new Decimal(5).times(player.B.points.add(1)))
        if (player.Be.sulfuricAcid.gte(10) && player.Be.saturnIce.gte(342)) player.Be.sulfuricAcid = player.Be.sulfuricAcid.sub(10), player.Be.saturnIce = player.Be.saturnIce.sub(342), player.Be.methaneGas = player.Be.methaneGas.add(new Decimal(5).times(player.B.points.add(1)))
        if (player.Be.s1 == 33 || player.Be.s2 == 33 || player.Be.s3 == 33 || player.Be.s4 == 33 || player.Be.s5 == 33 || player.Be.s6 == 33 || player.Be.s7 == 33 || player.Be.s8 == 33 || player.Be.s9 == 33 || player.Be.s10 == 33 || player.B.resets > 7 && player.Be.auto) player.Be.plutoCarbon = player.Be.plutoCarbon.add(player.B.baseT2).add(new Decimal(100).times(player.B.points.add(1)))
        if (player.Be.plutoCarbon.gte(10000) && player.Be.solarBar.gte(9) && player.Be.methaneGas.gte(15) && player.Be.uranusAmmonia.gte(30) && player.Be.neptuneSlush.gte(15)) player.Be.plutoCarbon = player.Be.plutoCarbon.sub(10000), player.Be.solarBar = player.Be.solarBar.sub(9), player.Be.methaneGas = player.Be.methaneGas.sub(15), player.Be.uranusAmmonia = player.Be.uranusAmmonia.sub(30), player.Be.neptuneSlush = player.Be.neptuneSlush.sub(15), player.Be.plutonium = player.Be.plutonium.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.s1 == 34 || player.Be.s2 == 34 || player.Be.s3 == 34 || player.Be.s4 == 34 || player.Be.s5 == 34 || player.Be.s6 == 34 || player.Be.s7 == 34 || player.Be.s8 == 34 || player.Be.s9 == 34 || player.Be.s10 == 34 || player.B.resets > 8 && player.Be.auto) player.Be.uranusWater = player.Be.uranusWater.add(player.B.baseT2).add(new Decimal(10).times(player.B.points.add(1)))
        if (player.Be.basaltrock.gte(100) && player.Be.uranusWater.gte(1000)) player.Be.basaltrock = player.Be.basaltrock.sub(100), player.Be.uranusWater = player.Be.uranusWater.sub(1000), player.Be.uranusAmmonia = player.Be.uranusAmmonia.add(new Decimal(10).times(player.B.points.add(1)))
        if (player.Be.s1 == 35 || player.Be.s2 == 35 || player.Be.s3 == 35 || player.Be.s4 == 35 || player.Be.s5 == 35 || player.Be.s6 == 35 || player.Be.s7 == 35 || player.Be.s8 == 35 || player.Be.s9 == 35 || player.Be.s10 == 35 || player.B.resets > 9 && player.Be.auto) player.Be.neptuneCloud = player.Be.neptuneCloud.add(player.B.baseT2).add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.jupiterHelium.gte(5) && player.Be.neptuneCloud.gte(50)) player.Be.jupiterHelium = player.Be.jupiterHelium.sub(5), player.Be.neptuneCloud = player.Be.neptuneCloud.sub(50), player.Be.neptuneSlush = player.Be.neptuneSlush.add(new Decimal(3).times(player.B.points.add(1)))
        if (player.Be.s1 == 41 || player.Be.s2 == 41 || player.Be.s3 == 41 || player.Be.s4 == 41 || player.Be.s5 == 41 || player.Be.s6 == 41 || player.Be.s7 == 41 || player.Be.s8 == 41 || player.Be.s9 == 41 || player.Be.s10 == 41 || player.B.resets > 1 && player.Be.auto) player.Be.mercuryDust = player.Be.mercuryDust.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.mercuryDust.gte(100)) player.Be.mercuryDust = player.Be.mercuryDust.sub(100), player.Be.metalliccore = player.Be.metalliccore.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.s1 == 42 || player.Be.s2 == 42 || player.Be.s3 == 42 || player.Be.s4 == 42 || player.Be.s5 == 42 || player.Be.s6 == 42 || player.Be.s7 == 42 || player.Be.s8 == 42 || player.Be.s9 == 42 || player.Be.s10 == 42 || player.B.resets > 2 && player.Be.auto) player.Be.venusDust = player.Be.venusDust.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.venusDust.gte(67)) player.Be.venusDust = player.Be.venusDust.sub(67), player.Be.sulfuricAcid = player.Be.sulfuricAcid.add(new Decimal(2).times(player.B.points.add(1)))
        if (player.Be.s1 == 43 || player.Be.s2 == 43 || player.Be.s3 == 43 || player.Be.s4 == 43 || player.Be.s5 == 43 || player.Be.s6 == 43 || player.Be.s7 == 43 || player.Be.s8 == 43 || player.Be.s9 == 43 || player.Be.s10 == 43 || player.B.resets > 0 && player.Be.auto) player.Be.moonDust = player.Be.moonDust.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.moonDust.gte(10)) player.Be.moonDust = player.Be.moonDust.sub(10), player.Be.moltenIron = player.Be.moltenIron.add(new Decimal(3).times(player.B.points.add(1)))
        if (player.Be.s1 == 44 || player.Be.s2 == 44 || player.Be.s3 == 44 || player.Be.s4 == 44 || player.Be.s5 == 44 || player.Be.s6 == 44 || player.Be.s7 == 44 || player.Be.s8 == 44 || player.Be.s9 == 44 || player.Be.s10 == 44 || player.B.resets > 3 && player.Be.auto) player.Be.marsDust = player.Be.marsDust.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.marsDust.gte(40)) player.Be.marsDust = player.Be.marsDust.sub(40), player.Be.basaltrock = player.Be.basaltrock.add(new Decimal(8).times(player.B.points.add(1)))
        if (player.Be.s1 == 45 || player.Be.s2 == 45 || player.Be.s3 == 45 || player.Be.s4 == 45 || player.Be.s5 == 45 || player.Be.s6 == 45 || player.Be.s7 == 45 || player.Be.s8 == 45 || player.Be.s9 == 45 || player.Be.s10 == 45 || player.B.resets > 4 && player.Be.auto) player.Be.jupiterHydrogen = player.Be.jupiterHydrogen.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.jupiterHydrogen.gte(90)) player.Be.jupiterHydrogen = player.Be.jupiterHydrogen.sub(90), player.Be.jupiterHelium = player.Be.jupiterHelium.add(new Decimal(1).times(player.B.points.add(1)))
        if (player.Be.ALight >= player.B.points.add(1)) player.Be.ALight = player.Be.ALight.times(0).add(player.B.points.add(1))
        if (player.Be.gHeliumHydride >= player.B.points.add(1)) player.Be.gHeliumHydride = player.Be.gHeliumHydride.times(0).add(player.B.points.add(1))
        if (player.Be.bunknown >= player.B.points.add(1)) player.Be.bunknown = player.Be.bunknown.times(0).add(player.B.points.add(1))
        if (player.Be.lWaterCloud >= player.B.points.add(1)) player.Be.lWaterCloud = player.Be.lWaterCloud.times(0).add(player.B.points.add(1))
        if (player.Be.jDiamond >= player.B.points.add(1)) player.Be.jDiamond = player.Be.jDiamond.times(0).add(player.B.points.add(1))
        if (hasMilestone('B', 4)) buyBuyable('Be', 12), buyBuyable('Be', 13), buyBuyable('Be', 14), buyBuyable('Be', 16)
        if (hasMilestone('B', 4) && getBuyableAmount('Be', 12) == 10 && getBuyableAmount('Be', 13) == 10) buyBuyable('Be', 15)
        if (hasMilestone('B', 2)) player.Li.Li1 = player.Li.Li1.times(0).add(71), player.Li.H1 = player.Li.H1.times(0).add(73)
    },

    doReset() {
        let keptUpgrades = []
        let keptMilestones = []
        if (player.B.resets > 0) keptUpgrades.push(...player.Be.upgrades.slice(0, player.B.resets)), setBuyableAmount('Be', 11, 50)
        if (player.B.resets > 4) keptMilestones.push(...player.Be.milestones.slice(0, player.B.resets))
        layerDataReset(this.layer)
        if (player.B.resets > 0) player.Be.BerylliumPlates = player.Be.BerylliumPlates.add(player.B.resets.times(10)), setBuyableAmount('Be', 11, player.B.resets.times(10))
        if (player.B.resets > 10) player.Be.BerylliumPlates = player.Be.BerylliumPlates.times(0).add(50)
        if (player.B.resets > 6) player.Be.Rocketships = player.Be.Rocketships.times(0).add(10), player.Be.Activeships = player.Be.Rocketships, setBuyableAmount('Be', 21, new Decimal(10))
        player.Be.upgrades.push(...keptUpgrades)
        player.Be.milestones.push(...keptMilestones)
    },
})

addLayer("B", {

    symbol() { return options.toggleButtonAnimations ? '' : 'B' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#964b00',
            'background-image': 'url("resources/Boron.gif")',
            'background-position': 'center center',
            'background-size': '120%',
            'border': '1px solid #964b00'
        } : {
            'background-position': 'center center',
            'background-size': '85%'
        }
    },
    
    image: "https://i.postimg.cc/J4LnSfTP/Screenshot-2022-07-10-165312-1-removebg-preview.png",
    name: "Boron", // This is optional, only used in a few places, If absent it just uses the layer id.
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            total: new Decimal(0),
            points: new Decimal(0),
            resets: new Decimal(0),
            baseT2: new Decimal(0),
            Scraps: new Decimal(0),
            Ticks: new Decimal(0),
            Ticks1: new Decimal(0),
            TicksMax: new Decimal(0),
            DS: new Decimal(0),
            backtohun: new Decimal(0),
            Size: new Decimal(0),
            Size1: new Decimal(0),
            Size2: new Decimal(0),
            Slider: [],
            Trigger: new Decimal(0),
            Pos1: new Decimal(0),
            Pos2: new Decimal(0),
            Deg: new Decimal(0),
            SDeg: new Decimal(0),
            Reward: new Decimal(0),
            Boron: new Decimal(0),
            BM: new Decimal(1),
            BB: new Decimal(0),
            BM1: new Decimal(1),
            BM2: new Decimal(0),
            BM3: new Decimal(0),
            BB1: new Decimal(0),
            TickSped: new Decimal(1),
            DrillingSped: new Decimal(0),
            TickSpedStored: new Decimal(0),
            TickBase: new Decimal(1),
            TickBaseStored: new Decimal(0),
            State: new Decimal(0),
            Added: new Decimal(0),
            Added1: new Decimal(0),
            Times: new Decimal(1),
            Times1: new Decimal(1),  
            Times2: new Decimal(1),
            Next: new Decimal(0),
        }
    },

  

    color: '#964b00',
    layerShown() {
        if (player.B.resets.gte(1)) return true
        if (player.Be.rainbownium.gte(1)) return true
        else return false
    },

    onPrestige() {
        player.B.resets = player.B.resets.add(1)
    },

    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Prisms", // Name of prestige currency
    baseResource: "Rainbownium", // Name of resource prestige is based on
    baseAmount() { return player.Be.rainbownium }, // Get the current amount of baseResource
    requires: new Decimal(1),
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {  
        if (player.B.points.gte(100)) return 0.2
        else return 1}, // Prestige currency exponent
    gainMult: new Decimal(1), 
    gainExp: new Decimal(1),
    row: 1, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        { key: "r", description: "R: Reset for Boron", onPress() { if (canReset(this.layer)) doReset(this.layer)}, 
        unlocked() { if (hasUpgrade('B', 21)) return false
        else return true}},
    ],

    passiveGeneration() {
        if (hasUpgrade('B', 21)) return 1
    },

    tooltip() { return formatWhole(player.B.points) + "  Prisms" },
    tooltipLocked() { return formatWhole(player.B.points) + " Prisms" },
    
    milestones: {
        1: {
            style: { "color": "#ededed" },
            requirementDescription: "1 Boron Reset",
            effectDescription: "Keep 1 upgrade, auto 1 planet, and keep 10 Beryllium Plate buyables per reset. Toggle autobuy planets.",
            done() { return player.B.resets.gte(1) },
            toggles: [["Be", "auto"]],
            onComplete() { player.E.points = player.E.points.add(1) },
        },
        2: {
            style: { "color": "#ededed" },
            requirementDescription: "2 Boron Resets",
            effectDescription: "Unlock Beryllium button automation.",
            done() { return player.B.resets.gte(2) },
        },
        3: {
            style: { "color": "#ededed" },
            requirementDescription: "3 Boron Resets",
            effectDescription: "Tier 2 planets start with a base of 10,000.",
            done() { return player.B.resets.gte(3) },
            onComplete() {player.B.baseT2 = player.B.baseT2.add(9999)},
        },
        4: {
            style: { "color": "#ededed" },
            requirementDescription: "5 Boron Resets",
            effectDescription: "Keep all rocketship part buyables. Also keep both milestones.",
            done() { return player.B.resets.gte(5) },
        },
        5: {
            style: { "color": "#ededed" },
            requirementDescription: "7 Boron Resets",
            effectDescription: "Keep all rocketships.",
            done() { return player.B.resets.gte(7) },
        },
    },


    buyables: {
         11: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            display() { 
                return "<div> Make a Diamond Saw Blade.<div> <i>Requires:</i> 180 Diamonds, 100,000 Metallic Cores, 1,000,000 Basalt Rocks and 190 Prisms. <div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
               },
            canAfford() { 
               return player.Be.jDiamond.gte(180) && player.Be.metalliccore.gte(100000) && player.Be.basaltrock.gte(1000000) && player.B.points.gte(160)
            },
            purchaseLimit: 1,
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.B.Scraps = player.B.Scraps.add(1)
                player.B.Ticks = player.B.Ticks.times(0).add(1000)
                player.B.Ticks1 = player.B.Ticks1.times(0)
                player.B.TicksMax = player.B.TicksMax.times(0).add(1000)
            },
            unlocked() {
                if (player.B.resets.gte(1)) return true
                else return false
            },
        },
        12: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            display() { 
                return "<div> Make a Handle.<div> <i>Requires:</i> 200 Lights, 2,000,000 Slush, 1,000,000 Plutonium and 220 Prisms. Nothing can be burning.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
               },
            canAfford() { 
               return player.Be.ALight.gte(200) && player.Be.neptuneSlush.gte(2000000) && player.Be.plutonium.gte(1000000) && player.B.points.gte(220) && player.B.Ticks.lte(0)
            },
            purchaseLimit: 1,
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.B.Scraps = player.B.Scraps.add(1)
                player.B.Ticks = player.B.Ticks.times(0).add(2323)
                player.B.Ticks1 = player.B.Ticks1.times(0)
                player.B.TicksMax = player.B.TicksMax.times(0).add(2323)
            },
            unlocked() {
                if (getBuyableAmount('B', 11) == 1) return true
                else return false
            }
        },
        13: {
            style: {width: '125px', height: '120px', color: "#ededed"},
            display() { 
                return "<div> Make a Blade Guard.<div> <i>Requires:</i> 100,000,000 gwa, 5e9 Lasers, 20,000 Rainbownium and 250 Prisms. Nothing can be burning.<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + " / " + formatWhole((this.purchaseLimit))
               },
            canAfford() { 
               return player.Be.gwa.gte(100000000) && player.Be.laser.gte(5e9) && player.Be.rainbownium.gte(20000) && player.B.points.gte(250) && player.B.Ticks.lte(0)
            },
            purchaseLimit: 1,
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.B.Scraps = player.B.Scraps.add(1)
                player.B.Ticks = player.B.Ticks.times(0).add(666)
                player.B.Ticks1 = player.B.Ticks1.times(0)
                player.B.TicksMax = player.B.TicksMax.times(0).add(666)
            },
            unlocked() {
                if (getBuyableAmount('B', 12) == 1) return true
                else return false
            }
        },
        14: {
            style: {color: "#ededed"},
            unlocked() {
                if (hasUpgrade('B', 21)) return true
            },
            cost(x) { 
                if (hasUpgrade('B', 31)) return new Decimal(5.5).times(new Decimal(x).mul(x)).pow(2.5).sub(500000)
                if (hasUpgrade('B', 23)) return new Decimal(0.5).times(new Decimal(x).mul(x)).pow(2).sub(500000)
               else return new Decimal(45).times(new Decimal(1).add(x)).pow(1.21)},
            display() { return "Sharpen Your Blade <div> Cost: " + format(this.cost()) + "g of Boron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + '<div>Current Effect: +' + player.B.Added + ' to base of Drilling Speed'},
            canAfford() { return player[this.layer].Boron.gte(this.cost())},
            buy() {
             if (hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000000)), player.B.Added = getBuyableAmount(this.layer, this.id).pow(0.8)
             if (hasUpgrade('B', 33) && !hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Added = getBuyableAmount(this.layer, this.id).pow(0.8)
             if (hasUpgrade('B', 32) && !hasUpgrade('B', 33)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(10)), player.B.Added = getBuyableAmount(this.layer, this.id).pow(0.8)
             if (!hasUpgrade('B', 25) && !hasUpgrade('B', 32)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Added = getBuyableAmount(this.layer, this.id).pow(0.8)
             if (hasUpgrade('B', 25))player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Added = getBuyableAmount(this.layer, this.id).pow(1.2)
            },
        },
        15: {
            style: {color: "#ededed"},
            unlocked() {
                if (hasUpgrade('B', 22)) return true
            },
            cost(x) { 
                if (hasUpgrade('B', 31)) return new Decimal(5.5).times(new Decimal(x).mul(x)).pow(2.5).sub(500000)
                if (hasUpgrade('B', 23)) return new Decimal(0.5).times(new Decimal(x).mul(x)).pow(2).sub(500000)
                else return new Decimal(42).times(new Decimal(1).add(x)).pow(1.31)},
            display() { return "Enhance Your Blade <div> Cost: " + format(this.cost()) + "g of Boron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + '<div>Current Effect: x' + player.B.Times + ' to base of Drilling Speed'},
            canAfford() { return player[this.layer].Boron.gte(this.cost())},
            buy() {
                if (hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000000)), player.B.Times = getBuyableAmount(this.layer, this.id).pow(1.2).pow(0.3).times(player.B.Times1)
                if (hasUpgrade('B', 33) && !hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Times = getBuyableAmount(this.layer, this.id).pow(1.2).pow(0.3).times(player.B.Times1)
                if (hasUpgrade('B', 32) && !hasUpgrade('B', 33)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(10)), player.B.Times = getBuyableAmount(this.layer, this.id).pow(1.2)
                if (hasUpgrade('B', 25) && !hasUpgrade('B', 32)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times = getBuyableAmount(this.layer, this.id).pow(1.2)
                if (!hasUpgrade('B', 25)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times = getBuyableAmount(this.layer, this.id).pow(0.3).times(player.B.Times1)
            },
        },
        21: {
            
            style: {color: "#ededed"},
            unlocked() {
                if (hasUpgrade('B', 23)) return true
            },
            cost(x) {
                if (hasUpgrade('B', 31)) return new Decimal(0.1).times(new Decimal(x).mul(x)).pow(2.7)
                else return new Decimal(0.01).times(new Decimal(x).mul(x)).pow(2.5)},
            display() { return "Use A Better Handle<div> Cost: " + format(this.cost()) + "g of Boron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + '<div>Current Effect: x' + player.B.Times1 + ' to "Enhance Your Blade"'},
            canAfford() { return player[this.layer].Boron.gte(this.cost())},
            buy() {
                if (hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000000)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(1.5)
                if (hasUpgrade('B', 34) && !hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(1.5)
                if (hasUpgrade('B', 33) && !hasUpgrade('B', 34)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (hasUpgrade('B', 32) && !hasUpgrade('B', 33)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(10)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (hasUpgrade('B', 25) && !hasUpgrade('B', 32)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (!hasUpgrade('B', 25)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times1 = getBuyableAmount(this.layer, this.id).pow(0.5), player.B.Times = getBuyableAmount(this.layer, 15).pow(0.3).times(player.B.Times1)
            },
        },
        22: {
            
            style: {color: "#ededed"},
            unlocked() {
                if (hasUpgrade('B', 24)) return true
            },
            cost(x) { 
                if (hasUpgrade('B', 31)) return new Decimal(0.5).times(new Decimal(x).mul(x)).pow(2.8)
                if (!hasUpgrade('B', 31)) return new Decimal(0.05).times(new Decimal(x).mul(x)).pow(2.5)},
            display() { return "Buy A Better Blade Guard<div> Cost: " + format(this.cost()) + "g of Boron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + '<div>Current Effect: x' + player.B.Times2 + ' to Boron Multiplier'},
            canAfford() { return player[this.layer].Boron.gte(this.cost())},
            buy() {
                if (hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000000)), player.B.Times2 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (hasUpgrade('B', 33) && !hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Times2 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (hasUpgrade('B', 32) && !hasUpgrade('B', 33)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(10)), player.B.Times2 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (hasUpgrade('B', 31) && !hasUpgrade('B', 32)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times2 = getBuyableAmount(this.layer, this.id).pow(0.5)
                if (!hasUpgrade('B', 31)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Times2 = getBuyableAmount(this.layer, this.id).pow(0.2)
            },
        },
        23: {
            
            style: {color: "#ededed"},
            unlocked() {
                if (hasUpgrade('B', 25)) return true
            },
            cost(x) { 
                if (hasUpgrade('B', 31))  return new Decimal(1).times(new Decimal(x).mul(x)).pow(2.5)
                if (!hasUpgrade('B', 31)) return new Decimal(0.1).times(new Decimal(x).mul(x)).pow(2.5)},
            display() { return "Improve The Diamond Hand Saw Overall.<div> Cost: " + format(this.cost()) + "g of Boron<div> Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + '<div>Current Effect: +' + player.B.Added1 + ' to Boron Multiplier before other effects'},
            canAfford() { return player[this.layer].Boron.gte(this.cost())},
            buy() {
                if (hasUpgrade('B', 35))player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000000)), player.B.Added1 = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade('B', 33) && !hasUpgrade('B', 35)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1000)), player.B.Added1 = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade('B', 32) && !hasUpgrade('B', 33)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(10)), player.B.Added1 = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade('B', 31) && !hasUpgrade('B', 32)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Added1 = getBuyableAmount(this.layer, this.id)
                if (!hasUpgrade('B', 31)) player[this.layer].Boron = player[this.layer].Boron.sub(this.cost()), setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.B.Added1 = getBuyableAmount(this.layer, this.id).pow(0.5)
            },
        },
    },

    clickables: {
        11: {
            style: {color: "#ededed", 'border-radius': '44%'},
            title() {
                if (hasUpgrade('B', 21) && player.B.State == 1) return "Drill: ON"
                if (hasUpgrade('B', 21) && player.B.State == 0) return "Drill: OFF"
                else return "Drill"
            },
            display() { 
                if (options.mobileMode == true && !hasUpgrade('B', 21)) return 'Hover TO DRILL.<div>Drilling through ' + formatWhole(player.B.TicksMax) + ' Ticks/tick'
                if (options.mobileMode == false && !hasUpgrade('B', 21)) return 'Hold TO DRILL.<div>Drilling through ' + formatWhole(player.B.TicksMax) + ' Ticks/tick'
                if (hasUpgrade('B', 21)) return 'CLICK TO DRILL.<div>Drilling through ' + formatWhole(player.B.TicksMax) + ' Ticks/tick'},
            canClick() { return true},
            effect() {
                let effect = [];
                player.B.DrillingSped = temp['B'].clickables[11].effect
                effect = new Decimal(0.1).times(player.B.TickSped)
                if (player.B.Deg.gte(100)) effect = player.B.TickBase.add(player.B.Added).times(player.B.TickSped).times(player.B.Times)
                return effect
            },
            onClick() {
                if (hasUpgrade('B', 21) && player.B.State == 0) return player.B.State = player.B.State.add(1)
                if (hasUpgrade('B', 21) && player.B.State == 1) return player.B.State = player.B.State.times(0)
            },
            onHold() {  
                if(options.mobileMode == true){
                if (hasUpgrade('B', 21)) return ''
                player.B.TicksMax = temp['B'].clickables[11].effect
                player.B.SDeg = player.B.SDeg.add(1)
                if (player.B.Ticks.gte(1)) player.B.Ticks = player.B.Ticks.sub(temp['B'].clickables[11].effect)
                if (player.B.Ticks.gte(1) && player.B.Deg.lte(100)) player.B.Deg = player.B.Deg.add(player.B.Deg.times(0.1))
                if (player.B.Ticks.gte(1) && player.B.Deg.gte(101)) player.B.Deg = player.B.Deg.add(10)}
            },
            onHover() {
                if(options.mobileMode == false){
                if (hasUpgrade('B', 21)) return ''
                player.B.TicksMax = temp['B'].clickables[11].effect
                player.B.SDeg = player.B.SDeg.add(1)
                if (player.B.Ticks.gte(1)) player.B.Ticks = player.B.Ticks.sub(temp['B'].clickables[11].effect)
                if (player.B.Ticks.gte(1) && player.B.Deg.lte(100)) player.B.Deg = player.B.Deg.add(player.B.Deg.times(0.1))
                if (player.B.Ticks.gte(1) && player.B.Deg.gte(101)) player.B.Deg = player.B.Deg.add(10)}
            },
        },
    },

    upgrades: {
        11: {
            style: { "color": "#ededed" },
            title() { if (player.p.Node < 1) return "Bad Manners"
                        else return "BaD BreakInG"},
            description: "Boron Multiplier is now 2. Add one per upgrade on this row.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            effectDisplay() { return "x" + formatWhole(player.B.BM)},
            currencyLocation() { return player.B },
            cost() { 
                if (hasUpgrade('B', 12) && hasUpgrade('B', 13)) return new Decimal(100)
                if (hasUpgrade('B', 12) || hasUpgrade('B', 13) || hasUpgrade('B', 11)) return new Decimal(75)
                else return new Decimal(50)},
            effect() {
                if (hasUpgrade('B', 11)) player.B.BM = player.B.BM1
                if (hasUpgrade('B', 22)) player.B.BM = player.B.BM1.pow(2)
                if (hasUpgrade('B', 24)) player.B.BM = player.B.BM1.pow(2).pow(1.5).times(player.B.Times2)
                if (hasUpgrade('B', 25)) player.B.BM = player.B.BM1.add(player.B.Added1).pow(2).pow(1.5).times(player.B.Times2)
            },
            onPurchase() { return player.B.BM1 = player.B.BM1.add(1), player.B.BB1 = player.B.BB1.add(1), player.B.BM2 = player.B.BM2.add(1), player.B.TickSpedStored = player.B.TickSpedStored.add(1), player.B.TickBaseStored = player.B.TickBaseStored.add(1)},
            unlocked() {
                if (player.B.Boron.gte(1) || hasUpgrade('B', 12) || hasUpgrade('B', 13) || hasUpgrade('B', 11)) return true
                else return false
            },
        },
        12: {
            style: { "color": "#ededed" },
            title: "Good Manners",
            description: "Add 1 to Boron Base. Add one per upgrade on this row.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            effectDisplay() { return "+" + formatWhole(player.B.BB.sub(player.B.BM3))},
            currencyLocation() { return player.B },
            cost() { 
                if (hasUpgrade('B', 11) && hasUpgrade('B', 13)) return new Decimal(100)
                if (hasUpgrade('B', 11) || hasUpgrade('B', 13) || hasUpgrade('B', 12)) return new Decimal(75)
                else return new Decimal(50)},
            effect() {
                if (hasUpgrade('B', 12)) player.B.BB = player.B.BB1
                if (hasUpgrade('B', 13)) player.B.BB = player.B.BB1.add(player.B.BM3)
            },
            onPurchase() { 
                return player.B.BB1 = player.B.BB1.add(1), player.B.BM1 = player.B.BM1.add(1), player.B.BM2 = player.B.BM2.add(1), player.B.TickSpedStored = player.B.TickSpedStored.add(1), player.B.TickBaseStored = player.B.TickBaseStored.add(1)},
            unlocked() {
                if (player.B.Boron.gte(1) || hasUpgrade('B', 11) || hasUpgrade('B', 13) || hasUpgrade('B', 12)) return true
                else return false
            },
        },
        13: {
            style: { "color": "#ededed" },
            title: "Bonkers Manners",
            description: "Add Log2(2) to Boron Base. Add one per upgrade on this row.",
            effectDisplay() { return "+" + formatWhole(player.B.BM3)},
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { 
                if (hasUpgrade('B', 11) && hasUpgrade('B', 12)) return new Decimal(100)
                if (hasUpgrade('B', 11) || hasUpgrade('B', 12) || hasUpgrade('B', 13)) return new Decimal(75)
                else return new Decimal(50)},
                effect() {
                    if (hasUpgrade('B', 13)) player.B.BM3 = player.B.BM2
                },
            onPurchase() { 
                return player.B.BB1 = player.B.BB1.add(1), player.B.BM2 = player.B.BM2.add(1), player.B.BM1 = player.B.BM1.add(1), player.B.TickSpedStored = player.B.TickSpedStored.add(1), player.B.TickBaseStored = player.B.TickBaseStored.add(1)},
            unlocked() {
                if (player.B.Boron.gte(1) || hasUpgrade('B', 12) || hasUpgrade('B', 11) || hasUpgrade('B', 13)) return true
                else return false
            },
        },
        14: {
            style: { "color": "#ededed" },
            title: "False Dillema'd",
            description: "Drilling speed is doubled. Add one per upgrade on this row.",
            effectDisplay() { return "x" + formatWhole(player.B.TickSped)},
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(500)},
            effect() {
                if (hasUpgrade('B', 14)) player.B.TickSped = player.B.TickSpedStored
            },
            onPurchase() { 
                return player.B.BB1 = player.B.BB1.add(1), player.B.BM2 = player.B.BM2.add(1), player.B.BM1 = player.B.BM1.add(1), player.B.TickSpedStored = player.B.TickSpedStored.add(1), player.B.TickBaseStored = player.B.TickBaseStored.add(1)},
            unlocked() {
                if (hasUpgrade('B', 13)) return true
                else return false
            },
        },
        15: {
            style: { "color": "#ededed" },
            title: "Fallacies 101",
            description: "Add 1 to base of Drilling speed. Add one per upgrade on this row.",
            effectDisplay() { return "+" + formatWhole(player.B.TickBaseStored)},
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(1420)},
            effect() {
                if (hasUpgrade('B', 15)) player.B.TickBase = player.B.TickBaseStored.add(1)
            },
            onPurchase() { 
                return player.B.BB1 = player.B.BB1.add(1), player.B.BM2 = player.B.BM2.add(1), player.B.BM1 = player.B.BM1.add(1), player.B.TickSpedStored = player.B.TickSpedStored.add(1), player.B.TickBaseStored = player.B.TickBaseStored.add(1)},
            unlocked() {
                if (hasUpgrade('B', 14)) return true
                else return false
            },
        },
        21: {
            style: { "color": "#ededed" },
            title: "Early Automation",
            description: "Unlock Boron button automation. Also unlock a buyble per upgrade on this row.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(200000)},
            unlocked() {
                if (hasUpgrade('B', 15)) return true
                else return false
            },
        },
        22: {
            style: { "color": "#ededed" },
            title: "Enriched Boron",
            description: "Add the power of 2 to the Boron Multiplier.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(2000000)},
            unlocked() {
                if (hasUpgrade('B', 21)) return true
                else return false
            },
        },
        23: {
            style: { "color": "#ededed" },
            title: "NMR",
            description: "Lower cost of the first two buyables by subtacting 500,000 but set there buyable amounts to 1 and cost scales much higher.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(1e9)},
            onPurchase() { 
                return [14,15].forEach(i=>player.B.buyables[i] = new Decimal(1))},
            unlocked() {
                if (hasUpgrade('B', 22)) return true
                else return false
            },
        },
        24: {
            style: { "color": "#ededed" },
            title: "CVD",
            description: "Add the power of 1.5 to the Boron Multiplier.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(1e9)},
            unlocked() {
                if (hasUpgrade('B', 23)) return true
                else return false
            },
        },
        25: {
            style: { "color": "#ededed" },
            title: "Boronated Fiberglass",
            description: "The first two buyables are more effective and autobuy the first row.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(5e10)},
            unlocked() {
                if (hasUpgrade('B', 24)) return true
                else return false
            },
        },
        31: {
            style: { "color": "#ededed" },
            title: "Borosilicate Glass",
            description: "The bottom row of buyables are more effective and autobuy the bottom row but increase cost scaling of all buyables. Keep cost.",
            currencyDisplayName: "Drilling Speed",
            currencyInternalName: "DrillingSped",
            currencyLocation() { return player.B },
            cost() { return new Decimal(1e9)},
            unlocked() {
                if (hasUpgrade('B', 25)) return true
                else return false
            },
        },
        32: {
            style: { "color": "#ededed" },
            title: "Tank Armor And Bulletproof Vests",
            description: "Autobuyers autobuy 10x faster. Keep cost.",
            currencyDisplayName: "Drilling Speed",
            currencyInternalName: "DrillingSped",
            currencyLocation() { return player.B },
            cost() { return new Decimal(2e10)},
            unlocked() {
                if (hasUpgrade('B', 31)) return true
                else return false
            },
        },
        33: {
            style: { "color": "#ededed" },
            title: "Tavaborole, A Aminoacyl tRNA Synthetase Inhibitor",
            description: "Autobuyers autobuy 100x faster.",
            currencyDisplayName: "Drilling Speed",
            currencyInternalName: "DrillingSped",
            currencyLocation() { return player.B },
            cost() { return new Decimal(5e12)},
            unlocked() {
                if (hasUpgrade('B', 32)) return true
                else return false
            },
        },
        34: {
            style: { "color": "#ededed" },
            title: "Boron-Chelate Complex, Rosocyanine",
            description: "The third buyable is more effective.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(1e35)},
            unlocked() {
                if (hasUpgrade('B', 33)) return true
                else return false
            },
        },
        35: {
            style: { "color": "#ededed" },
            title: "Boron Deficiency.",
            description: "Autobuy 1000x more.",
            currencyDisplayName: "Boron",
            currencyInternalName: "Boron",
            currencyLocation() { return player.B },
            cost() { return new Decimal(3e43)},
            unlocked() {
                if (hasUpgrade('B', 34)) return true
                else return false
            },
        },
    },

    infoboxes: {
        lore: {
            titleStyle: { "color": "#ededed" },
            title: "Boron",
            body() { return "Woah man, that was quite the crash landing! Something must of hit your ship hard. Hey wait, what's that over there? That, you know, that massive crater. Wait, yoooo. There's some meteorite debris over there. Go check that stuff out! We'll get Boron! Actually, first of all, we need to create an electric diamond hand saw. Anyway, do whatever it is you do and when you're ready let's start crafting." },
        },
        lore1: {
            titleStyle: { "color": "#ededed" },
            title: "The Workshop",
            body() { return "Nice going. You got the diamond hand saw with ease. Now comes the fun part. Use that saw and start drilling into the meteorites. Remember: The bigger they are, the more abundant they are in Boron." },
        },
        lore2: {
            titleStyle: { "color": "#ededed" },
            title: "Boron",
            body() { return "Holy shit man, you just crash landed like that?! Something must of hit your ship hard. Hey wait, what's that over there? That, you know, that massive crater. Wait, yoooo. Yeah bitch! There's some meteorite debris over there. Go check that shit out! We'll get Boron! Actually, first of all, we need to create an electric diamond hand saw. Anyway, do whatever it is you do and when you're ready let's start crafting." },
        },
    },

componentStyles: {
    "prestige-button"() { return {color: "#ededed"}}
},

    tabFormat: {
        "MainTab": {
            content: [
                () => (options.matureMode == false) ? ['infobox', 'lore'] : ['infobox', 'lore2'],
                ['display-text',
            function() { if (player.p.Node < 1) return 'Prisms boosts all Beryllium resources by ' + formatWhole(player.B.points.add(1)) + '. Cost scales at 100 rainbownium.'}],
            "blank",
                "main-display",
                () => (hasUpgrade('B', 21)) ? "" : "prestige-button",
                "blank",
            ['display-text',
            function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.Be.rainbownium) + ' Rainbownium'}],
            "blank",
            ['display-text',
            function() { if (player.p.Node < 1) return 'You have done ' + formatWhole(player.B.resets) + ' Boron Resets'}],
            'milestones',
            ['display-text',
            function() { if (player.p.Node < 1 && player.B.Ticks.gte(1) && player.B.Boron.lte(0)) return 'Time until finished burning: ' + formatWhole(player.B.Ticks) + ' ticks.'}],
            ["row", function () {
                if (player.B.resets.gte(1)) return [ 
                    ["display-image", 'https://i.postimg.cc/26zC4rq1/Furnace-transformed.jpg', { 'height': `400px`, 'width': `500px`, position: 'absolute', right: '110px', top: '1000px', id: 'under'}],
            ]}],
            ["row", function () {
                if (player.B.Scraps.gte(1)) return [ 
                    ["display-image", 'https://i.postimg.cc/gkS5sRJy/iron-metal-png-forest-lake-minnesota-scrap-metal-recycling-570-removebg-preview.png', { transform: `rotate(6deg)`, height: `200px`, width: `370px`, position: 'absolute',  right: '170px', top: "1208px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.Scraps.gte(1)) return [ 
                    ["display-image", 'https://i.postimg.cc/2jL8PP3M/image.png', { transform: `rotate(6deg)`, height: `200px`, width: `370px`, position: 'absolute',  right: '170px', top: "1208px", id: 'top', opacity: player.B.Ticks1.div(player.B.TicksMax)}],
            ]}],
            ["row", function () {
                if (player.B.resets.gte(1)) return [ 
                    ["display-image", 'https://i.postimg.cc/T3Ws08Gc/OYQpn-X-637597350.png', {'background-image': 'url("resources/Fire.gif")', height: `200px`, width: `370px`, position: 'absolute',  right: '170px', top: "1185px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(1)) return [ 
                    ["display-image", 'https://i.postimg.cc/9fx05nKk/ediamondtools-diamond-blades-lk16xh1-64-1000-removebg-preview.png', { height: `200px`, width: `200px`, position: 'absolute',  right: '270px', top: "1608px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/bYB4ZcKT/C14-PRO-removebg-preview-2.png', { height: `240px`, width: `400px`, position: 'absolute',  right: '275px', top: "1586px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(2)) return [ 
                    ["display-image", 'https://i.postimg.cc/Y9XNhRVG/C14-PRO-removebg-preview-1.png', { height: `200px`, width: `300px`, position: 'absolute',  right: '320px', top: "1608px", id: 'top'}],
            ]}],
            "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank",
            ["row", function () {
                if (player.B.DS.lt(3)) return [
                ['buyable', 11],   
                ['buyable', 12],      
                ['buyable', 13],                 
        ]}],
        ]
    },
    "The Workshop": {
        content: [
            ['infobox', 'lore1'],
            ['display-text',
            function() { 
                if (player.B.Slider == 1 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 2 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 3 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 4 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 5 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 6 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 7 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 8 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 9 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''
                if (player.B.Slider == 10 && player.B.Ticks.lt(1) && options.disableParticles == true && player.tab == this.layer) return makeParticles(PartB, 1), ''}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/YSnryDsC/2017-05-09-001-2017-05-09-007-removebg-preview.png', { transform: `rotate(-2deg)`, height: `700px`, width: `800px`, position: 'absolute',  right: '-20px', top: "300px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/9fx05nKk/ediamondtools-diamond-blades-lk16xh1-64-1000-removebg-preview.png', {transform: `rotate(${player.B.Deg}deg)`, height: `200px`, width: `200px`, position: 'absolute',   right: `${player.B.Pos1.add(470)}px`, top: `408px`, id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.Deg.gte(100) && !hasUpgrade('B', 21)) return [ 
                    ["display-image", 'https://i.postimg.cc/T3Ws08Gc/OYQpn-X-637597350.png', {'background-image': 'url("resources/Sparks.gif")', transform: `rotate(130deg)`, height: `200px`, width: `370px`, position: 'absolute',  right: `${player.B.Pos2.add(10)}px`, top: "520px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.Deg.gte(100) && player.B.State == 1) return [ 
                    ["display-image", 'https://i.postimg.cc/T3Ws08Gc/OYQpn-X-637597350.png', {'background-image': 'url("resources/Sparks.gif")', transform: `rotate(130deg)`, height: `200px`, width: `370px`, position: 'absolute',  right: `${player.B.Pos2.add(10)}px`, top: "520px", id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/bYB4ZcKT/C14-PRO-removebg-preview-2.png', { transform: `rotate(15deg)`, height: `240px`, width: `400px`, position: 'absolute',  right: `${player.B.Pos1.add(475)}px`, top: `356px`, id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/Y9XNhRVG/C14-PRO-removebg-preview-1.png', {height: `200px`, width: `300px`, position: 'absolute',  right: `${player.B.Pos1.add(510)}px`, top: `408px`, id: 'top'}],
            ]}],
            ["row", function () {
                if (player.B.DS.gte(3)) return [ 
                    ["display-image", 'https://i.postimg.cc/kMRpNkhq/asteroid-transparent-9.png', { transform: `rotate(-30deg)`, height: `${player.B.Size}px`, width: `${player.B.Size}px`, position: 'absolute',  right: `${player.B.Size1.add(320)}px`, top: `${player.B.Size2.add(400)}px`, id: 'top'}],
            ]}],
            ['display-text',
            function() { if (player.p.Node < 1) return 'Meteorite size: '+ formatWhole(player[this.layer].Slider) + ' cm.'}], 
            ["slider", ["Slider", 1, 10]],
            "blank",
            ['display-text',
            function() { 
                if (player.p.Node < 1 && player.B.Ticks.gte(0)) return 'Time until finished drilling: ' + formatWhole(player.B.Ticks) + ' ticks. Reward: ' + formatWhole(player.B.Reward) + 'g of Boron.'
                if (player.p.Node < 1 && player.B.Ticks.lt(0)) return 'Time until finished drilling: 0 ticks. Reward: ' + formatWhole(player.B.Reward) + 'g of Boron.'}],
            ['display-text',
            function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.B.Boron) + 'g of Boron from meteorites.'}],
            "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank","blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", 
            () => (player.B.Slider == 0) ? "" : "clickables",
            "upgrades",
        ],
        unlocked() {
            if (player.B.DS.gte(3)) return true
            else return false
        }
    },
    "Buyables": {
        content: [
            ['display-text',
            function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.B.Boron) + 'g of Boron from meteorites.'}],
            ["row", [
        ['buyable', 14],   
        ['buyable', 15],      
        ['buyable', 21],
        ['buyable', 22],
        ['buyable', 23],                  
            ]]  
        ],
        unlocked() {
            if (hasUpgrade('B', 21)) return true
            else return false
        }
    },
},

const: PartB = {
    image() {   
       return ''},
    text() {
    if (player.B.Slider == 1) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(1).add(player.B.BB)))
    if (player.B.Slider == 2) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(666).add(player.B.BB)))
    if (player.B.Slider == 3) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(21212).add(player.B.BB)))
    if (player.B.Slider == 4) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(525109).add(player.B.BB)))
    if (player.B.Slider == 5) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(8880000).add(player.B.BB)))
    if (player.B.Slider == 6) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(222260000).add(player.B.BB)))
    if (player.B.Slider == 7) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(8e9).add(player.B.BB)))
    if (player.B.Slider == 8) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(5e11).add(player.B.BB)))
    if (player.B.Slider == 9) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(7e14).add(player.B.BB)))
    if (player.B.Slider == 10) return 'Boron +' + formatWhole(player.B.BM.times(new Decimal(1e20).add(player.B.BB)))
    },
    x() {
    if (player.B.Slider == 1) return 1000 
        if (player.B.Slider == 2) return 975
        if (player.B.Slider == 3) return 950
        if (player.B.Slider == 4) return 935
        if (player.B.Slider == 5) return 910
        if (player.B.Slider == 6) return 890
        if (player.B.Slider == 7) return 885
        if (player.B.Slider == 8) return 880
        if (player.B.Slider == 9) return 875
        if (player.B.Slider == 10) return 875},
    y() { return 1250 - tmp.currentSt},
    offset: () => Math.random() + 1.2 * 700,
    dir() {return (Math.random() + 1.2) * 8},
    style: { "background-size": "100% 100%", color: '#964b00', 'text-shadow': '0 0 40px #fff'},
    gravity: 0.1,
    time: 2,
    speed() { // Randomize speed a bit
        return (Math.random() + 1.2) * 8  
    },
},

update() {
    if (player.B.points.gte(100) && player.B.backtohun.lte(0)) player.B.backtohun = player.B.backtohun.add(1), player.B.points = player.B.points.times(0).add(100)
    if (player.B.Scraps.gte(1) && player.B.DS.lte(2)) player.B.Ticks = player.B.Ticks.sub(1)
    if (player.B.Scraps.gte(1) && player.B.DS.lte(2)) player.B.Ticks1 = player.B.Ticks1.add(1)
    if (player.B.Ticks.lte(0) && player.B.Scraps.gte(1)) player.B.Scraps = player.B.Scraps.times(0), player.B.DS = player.B.DS.add(1)
    if (player.B.Slider == 1) player.B.Reward = player.B.BM.times(new Decimal(1).add(player.B.BB))
    if (player.B.Slider == 2) player.B.Reward = player.B.BM.times(new Decimal(666).add(player.B.BB))
    if (player.B.Slider == 3) player.B.Reward = player.B.BM.times(new Decimal(21212).add(player.B.BB))
    if (player.B.Slider == 4) player.B.Reward = player.B.BM.times(new Decimal(525109).add(player.B.BB))
    if (player.B.Slider == 5) player.B.Reward = player.B.BM.times(new Decimal(8880000).add(player.B.BB))
    if (player.B.Slider == 6) player.B.Reward = player.B.BM.times(new Decimal(222260000).add(player.B.BB))
    if (player.B.Slider == 7) player.B.Reward = player.B.BM.times(new Decimal(8e9).add(player.B.BB))
    if (player.B.Slider == 8) player.B.Reward = player.B.BM.times(new Decimal(5e11).add(player.B.BB))
    if (player.B.Slider == 9) player.B.Reward = player.B.BM.times(new Decimal(7e14).add(player.B.BB))
    if (player.B.Slider == 10) player.B.Reward = player.B.BM.times(new Decimal(1e20).add(player.B.BB))
    if (player.B.Slider == 1 && player.B.Trigger != 1) player.B.Size = player.B.Size.times(0).add(37.795275591), player.B.Size1 = player.B.Size1.times(0).add(-60), player.B.Size2 = player.B.Size2.times(0).add(170), player.B.Ticks = player.B.Ticks.times(0).add(100), player.B.Trigger = player.B.Trigger.times(0).add(1), player.B.Pos2 = player.B.Pos2.times(0)
    if (player.B.Slider == 2 && player.B.Trigger != 2) player.B.Size = player.B.Size.times(0).add(75.590551181), player.B.Size1 = player.B.Size1.times(0).add(-80), player.B.Size2 = player.B.Size2.times(0).add(140), player.B.Ticks = player.B.Ticks.times(0).add(3000), player.B.Trigger = player.B.Trigger.times(0).add(2), player.B.Pos2 = player.B.Pos2.times(0).add(15)
    if (player.B.Slider == 3 && player.B.Trigger != 3) player.B.Size = player.B.Size.times(0).add(113.38582677), player.B.Size1 = player.B.Size1.times(0).add(-100), player.B.Size2 = player.B.Size2.times(0).add(110), player.B.Ticks = player.B.Ticks.times(0).add(90000), player.B.Trigger = player.B.Trigger.times(0).add(3), player.B.Pos2 = player.B.Pos2.times(0).add(30)
    if (player.B.Slider == 4 && player.B.Trigger != 4) player.B.Size = player.B.Size.times(0).add(151.18110236), player.B.Size1 = player.B.Size1.times(0).add(-120), player.B.Size2 = player.B.Size2.times(0).add(80), player.B.Ticks = player.B.Ticks.times(0).add(930000), player.B.Trigger = player.B.Trigger.times(0).add(4), player.B.Pos2 = player.B.Pos2.times(0).add(45)
    if (player.B.Slider == 5 && player.B.Trigger != 5) player.B.Size = player.B.Size.times(0).add(188.97637795), player.B.Size1 = player.B.Size1.times(0).add(-140), player.B.Size2 = player.B.Size2.times(0).add(40), player.B.Ticks = player.B.Ticks.times(0).add(16000000), player.B.Trigger = player.B.Trigger.times(0).add(5), player.B.Pos2 = player.B.Pos2.times(0).add(80)
    if (player.B.Slider == 6 && player.B.Trigger != 6) player.B.Size = player.B.Size.times(0).add(226.77165354), player.B.Size1 = player.B.Size1.times(0).add(-160), player.B.Size2 = player.B.Size2.times(0).add(10), player.B.Ticks = player.B.Ticks.times(0).add(2e10), player.B.Trigger = player.B.Trigger.times(0).add(6), player.B.Pos2 = player.B.Pos2.times(0).add(90)
    if (player.B.Slider == 7 && player.B.Trigger != 7) player.B.Size = player.B.Size.times(0).add(264.56692913), player.B.Size1 = player.B.Size1.times(0).add(-180), player.B.Size2 = player.B.Size2.times(0).add(-30), player.B.Ticks = player.B.Ticks.times(0).add(4e11), player.B.Trigger = player.B.Trigger.times(0).add(7), player.B.Pos2 = player.B.Pos2.times(0).add(110)
    if (player.B.Slider == 8 && player.B.Trigger != 8) player.B.Size = player.B.Size.times(0).add(302.36220472), player.B.Size1 = player.B.Size1.times(0).add(-200), player.B.Size2 = player.B.Size2.times(0).add(-60), player.B.Ticks = player.B.Ticks.times(0).add(2e14), player.B.Trigger = player.B.Trigger.times(0).add(8), player.B.Pos2 = player.B.Pos2.times(0).add(130)
    if (player.B.Slider == 9 && player.B.Trigger != 9) player.B.Size = player.B.Size.times(0).add(340.15748031), player.B.Size1 = player.B.Size1.times(0).add(-220), player.B.Size2 = player.B.Size2.times(0).add(-90), player.B.Ticks = player.B.Ticks.times(0).add(2e23), player.B.Trigger = player.B.Trigger.times(0).add(9), player.B.Pos2 = player.B.Pos2.times(0).add(150)
    if (player.B.Slider == 10 && player.B.Trigger != 10) player.B.Size = player.B.Size.times(0).add(377.95275591), player.B.Size1 = player.B.Size1.times(0).add(-240), player.B.Size2 = player.B.Size2.times(0).add(-120), player.B.Ticks = player.B.Ticks.times(0).add(5e32), player.B.Trigger = player.B.Trigger.times(0).add(10), player.B.Pos2 = player.B.Pos2.times(0).add(170)
    if (player.B.Slider == 1 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(1).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(100)
    if (player.B.Slider == 2 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(666).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(3000)
    if (player.B.Slider == 3 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(21212).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(90000)
    if (player.B.Slider == 4 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(525109).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(930000)
    if (player.B.Slider == 5 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(8880000).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(16000000)
    if (player.B.Slider == 6 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(222260000).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(2e10)
    if (player.B.Slider == 7 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(8e9).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(4e11)
    if (player.B.Slider == 8 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(5e11).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(2e14)
    if (player.B.Slider == 9 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(7e14).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(2e23)
    if (player.B.Slider == 10 && player.B.Ticks.lt(1)) player.B.Boron = player.B.Boron.add(player.B.BM.times(new Decimal(1e20).add(player.B.BB))), player.B.Ticks = player.B.Ticks.times(0).add(5e32), player.B.Next = player.B.Next.add(1)
    if (player.B.SDeg.lte(0)) player.B.Pos1 = player.B.Pos1.times(0), player.B.Deg = player.B.Deg.times(0).add(1)
    if (player.B.Slider == 1 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-220)
    if (player.B.Slider == 2 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-200)
    if (player.B.Slider == 3 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-180)
    if (player.B.Slider == 4 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-160)
    if (player.B.Slider == 5 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-140)
    if (player.B.Slider == 6 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-120)
    if (player.B.Slider == 7 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-100)
    if (player.B.Slider == 8 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-80)
    if (player.B.Slider == 9 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-60)
    if (player.B.Slider == 10 && player.B.SDeg.gte(1)) player.B.Pos1 = player.B.Pos1.times(0).add(-40)
    if (player.B.Boron.lt(0)) player.B.Boron = player.B.Boron.times(0)
    if (hasUpgrade('B', 21) && player.B.State == 1){ player.B.SDeg = player.B.SDeg.add(1), player.B.TicksMax = temp['B'].clickables[11].effect
    if (player.B.Ticks.gte(1)) player.B.Ticks = player.B.Ticks.sub(temp['B'].clickables[11].effect)
    if (player.B.Deg.lte(100)) player.B.Deg = player.B.Deg.add(player.B.Deg.times(0.1))
    if (player.B.Deg.gte(101)) player.B.Deg = player.B.Deg.add(10)}
    if (hasUpgrade('B', 25)) buyBuyable('B', 14), buyBuyable('B', 15), buyBuyable('B', 21)
    if (hasUpgrade('B', 31)) buyBuyable('B', 22), buyBuyable('B', 23)
},
})

addLayer("C", {

    symbol() { return options.toggleButtonAnimations ? '' : 'C' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#00e600',
            'background-image': 'url("resources/Carbon.gif")',
            'background-position': 'center center',
            'background-size': '180%',
            'border': '1px solid #00e600'
        } : {
            'background-position': 'center center',
            'background-size': '100%'
        }
    },
    
    image: "https://i.postimg.cc/zXdM0zMB/Screenshot-2022-07-15-162004-1-removebg-preview-1.png",
    name: "Carbon", // This is optional, only used in a few places, If absent it just uses the layer id.
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            ticks: new Decimal(5),
            auto: new Decimal(0),
            auto1: new Decimal(0),
            unlocked: false,
            points: new Decimal(0),
            fragements: new Decimal(0),
            Nay: new Decimal(1), 
            Res: 0,
            No: new Decimal(0),
            Yes: new Decimal(0),
            Lol: 0,
            Switch: new Decimal(0),
            Switch1: new Decimal(0),
            Switch2: new Decimal(1),
            Year: new Decimal(1),
            Day: new Decimal(0),
            TotalD: new Decimal(0),
            TotalY: new Decimal(1),
            TotalCf: new Decimal(0),
            TotalC: new Decimal(0),
            Ticks: new Decimal(0),
            Levelptm: 1,
            Xpmaxptm: 100,
            Truemaxptm: 100,
            Xpptm: 5,
            XpToptm: 0,
            Carbonptm: 5,
            maxptm: 0,
            Levelftm: 1,
            Xpmaxftm: 100,
            Truemaxftm: 100,
            XpToftm: 0,
            Carbonftm: 9,
            maxftm: 0,
            LevelM: 1,
            XpmaxM: 200,
            TruemaxM: 200,
            XpToM: 0,
            CarbonM: 18,
            maxM: 0,
            LevelE: 1,
            XpmaxE: 600,
            TruemaxE: 600,
            XpToE: 0,
            CarbonE: 52,
            maxE: 0,
            LevelC: 1,
            XpmaxC: 800,
            TruemaxC: 800,
            XpToC: 0,
            CarbonC: 200,
            maxC: 0,
            Levelp: 1,
            Xpmaxp: 100,
            Truemaxp: 100,
            XpTop: 0,
            Carbonp: 9,
            maxp: 0,
            LevelG: 1,
            XpmaxG: 1000,
            TruemaxG: 1000,
            XpToG: 0,
            CarbonG: 66,
            maxG: 0,
            LevelJ: 1,
            XpmaxJ: 10000,
            TruemaxJ: 10000,
            XpToJ: 0,
            CarbonJ: 157,
            maxJ: 0,
            LevelB: 1,
            XpmaxB: 10000,
            TruemaxB: 10000,
            XpToB: 0,
            CarbonB: 544,
            maxB: 0,
            Levelf: 1,
            Xpmaxf: 100,
            Truemaxf: 100,
            Xpskill: 5,
            maxf: 0,
            XpTof: 0,
            LevelJB: 1,
            XpmaxJB: 100,
            TruemaxJB: 100,
            XpToJB: 0,    
            maxJB: 0,
            Levelpe: 1,
            Xpmaxpe: 200,
            Truemaxpe: 200,
            XpTope: 0,
            maxpe: 0,
            LevelR: 1,
            XpmaxR: 50,
            TruemaxR: 50,
            XpToR: 0,
            maxR: 0,
            LevelD: 1,
            XpmaxD: 100,
            TruemaxD: 100,
            XpToD: 0,
            maxD: 0,
            Levelt: 1,
            Xpmaxt: 200,
            Truemaxt: 200,
            XpTot: 0,
            maxt: 0,
            LevelW: 1,
            XpmaxW: 100,
            TruemaxW: 100,
            XpToW: 0,
            maxW: 0, 
            Mis1: new Decimal(0),
            Mis2: new Decimal(0),
            Mis3: new Decimal(0),
            Mis4: new Decimal(0),
            Mis5: new Decimal(0),
            ME1: 0,
            ME2: 0,
            ME3: 0,
            ME4: 0,
            ME5: 0,
        }
    },
            eptm: 1,
            eftm: 1,
            eM: 1,
            eE: 1,
            eC: 1,
            ep: 1,
            eG: 1,
            eJ: 1,
            eB: 1,
            ef: 1,
            eJB: 1,
            epe: 1,
            eR: 1,
            eD: 1,
            et: 1,
            eW: 1,
            Net: new Decimal(0),
            Income: new Decimal(0),
            Expenses: new Decimal(0), 
            Health: 0,
            JHealth: 0,
            OnOff: new Decimal(0),
           

    color: '#00e600',
    layerShown() {
        if (hasUpgrade('B', 14)) return true
        else return false
    },

    row: 2, // Row the layer is in on the tree (0 is the first row)


    tooltip() { return formatWhole(player.C.points) + " Carbon and " + formatWhole(player.C.fragements) + " Carbon Fragments."},
    tooltipLocked() { return "You must destroy the largest meteorite first." },

    bars: {
        PartMBar: {
            tooltip() {
                return `Wow Mr. Krabs has you working at $50 an hour! When I started working here I had to pay him $100 an hour.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(1)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                let progPM = []
                if (player.C.Xpmaxptm <= 0 && player.C.Switch == 1 && -getBaseLog(10, player.C.Levelptm) + 2 >= 0.1 || player.C.Xpmaxptm <= 0 && player.N.resets >= 10  && -getBaseLog(10, player.C.Levelptm) + 2 >= 0.1) player.C.Carbonptm = player.C.Carbonptm -getBaseLog(10, player.C.Levelptm) + 2 * tmp.N.CB
                if (player.C.Xpmaxptm <= 0 && player.C.Switch == 1 && -getBaseLog(10, player.C.Levelptm) + 2 < 0.1 || player.C.Xpmaxptm <= 0 && player.N.resets >= 10  && -getBaseLog(10, player.C.Levelptm) + 2 < 0.1) player.C.Carbonptm = player.C.Carbonptm + 0.1 * tmp.N.CB
                if (player.C.Xpmaxptm <= 0 && player.C.Switch == 1 || player.C.Xpmaxptm <= 0 && player.N.resets >= 10 ) player.C.Levelptm = player.C.Levelptm + 1, player.C.Xpmaxptm = player.C.Truemaxptm + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelptm)*1.6 + 40), player.C.Truemaxptm = player.C.Xpmaxptm, player.C.XpToptm = 0
                progPM = player.C.XpToptm / player.C.Truemaxptm
                return progPM
            },
            display() { return "Part-time Miner<div>-0.2 Health" },
            fillStyle() {if (player.C.Switch == 1 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 1 || player.N.resets >= 10 ) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        FullMBar: {
            tooltip() {
                return `You have now been fully integrated into the company.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(2)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.Xpmaxftm <= 0 && player.C.Switch == 2 && -getBaseLog(3, player.C.Levelftm) + 4 >= 0.1 || player.C.Xpmaxftm <= 0 && player.N.resets >= 10  && -getBaseLog(3, player.C.Levelftm) + 4 >= 0.1) player.C.Carbonftm = player.C.Carbonftm -getBaseLog(3, player.C.Levelftm) + 4 * tmp.N.CB
                if (player.C.Xpmaxftm <= 0 && player.C.Switch == 2 && -getBaseLog(3, player.C.Levelftm) + 4 < 0.1 || player.C.Xpmaxftm <= 0 && player.N.resets >= 10  && -getBaseLog(3, player.C.Levelftm) + 4 < 0.1) player.C.Carbonftm = player.C.Carbonftm + 0.1 * tmp.N.CB
                let progFM = []
                if (player.C.Xpmaxftm <= 0 && player.C.Switch == 2 || player.C.Xpmaxftm <= 0 && player.N.resets >= 10 ) player.C.Levelftm = player.C.Levelftm + 1, player.C.Xpmaxftm = player.C.Truemaxftm + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelftm)*1.4 + 100), player.C.Truemaxftm = player.C.Xpmaxftm, player.C.XpToftm = 0
                progFM = player.C.XpToftm / player.C.Truemaxftm
                return progFM
            },
            display() { return "Full-time Miner<div>-0.5 Health" },
            fillStyle() {if (player.C.Switch == 2 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 2 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        MineManager: {
            tooltip() {
                return `You're done with all the riff raff and have now been promoted to a management position!`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(3)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxM <= 0 && player.C.Switch == 3 && -getBaseLog(2, player.C.LevelM) + 5 >= 0.1 || player.C.XpmaxM <= 0 && player.N.resets >= 10  && -getBaseLog(2, player.C.LevelM) + 5 >= 0.1) player.C.CarbonM = player.C.CarbonM -getBaseLog(2, player.C.LevelM) + 5 * tmp.N.CB
                if (player.C.XpmaxM <= 0 && player.C.Switch == 3 && -getBaseLog(2, player.C.LevelM) + 5 < 0.1 || player.C.XpmaxM <= 0 && player.N.resets >= 10  && -getBaseLog(2, player.C.LevelM) + 5 < 0.1) player.C.CarbonM = player.C.CarbonM + 0.1 * tmp.N.CB
                let progM = []
                if (player.C.XpmaxM <= 0 && player.C.Switch == 3 || player.C.XpmaxM <= 0 && player.N.resets >= 10 ) player.C.LevelM = player.C.LevelM + 1, player.C.XpmaxM = player.C.TruemaxM + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelM)*1.6 + 200), player.C.TruemaxM = player.C.XpmaxM, player.C.XpToM = 0
                progM = player.C.XpToM / player.C.TruemaxM
                return progM
            },
            display() { return "Mine Manager<div>-0.3 Health" },
            fillStyle() {if (player.C.Switch == 3 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 3 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        EVP: {
            tooltip() {
                return `You now hold a major amount of power in the comapany. You help keep effeciency of the mines to the highest percent and answer only to the higher ups.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(4)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxE <= 0 && player.C.Switch == 4 && -getBaseLog(1.45, player.C.LevelE) + 7 >= 0.1 || player.C.XpmaxE <= 0 && player.N.resets >= 10  && -getBaseLog(1.45, player.C.LevelE) + 7 >= 0.1) player.C.CarbonE = player.C.CarbonE -getBaseLog(1.45, player.C.LevelE) + 7 * tmp.N.CB
                if (player.C.XpmaxE <= 0 && player.C.Switch == 4 && -getBaseLog(1.45, player.C.LevelE) + 7 < 0.1 || player.C.XpmaxE <= 0 && player.N.resets >= 10  && -getBaseLog(1.45, player.C.LevelE) + 7 < 0.1) player.C.CarbonE = player.C.CarbonE + 0.1 * tmp.N.CB
                let progE = []
                if (player.C.XpmaxE <= 0 && player.C.Switch == 4 || player.C.XpmaxE <= 0 && player.N.resets >= 10 ) player.C.LevelE = player.C.LevelE + 1, player.C.XpmaxE = player.C.TruemaxE + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelE)*1.7 + 600), player.C.TruemaxE = player.C.XpmaxE, player.C.XpToE = 0
                progE = player.C.XpToE / player.C.TruemaxE
                return progE
            },
            display() { return "Executive Vice President" },
            fillStyle() {if (player.C.Switch == 4 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 4 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        CEO: {
            tooltip() {
                return `You're the boogeyman. When workers look up at you, all they see is; "Get back to work!" You only give respect to those who deserve it. Those who grovle at your feet, otherwise they're not worth your time.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(5)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxC <= 0 && player.C.Switch == 5 && -getBaseLog(1.075, player.C.LevelC) + 24 >= 1 || player.C.XpmaxC <= 0 && player.N.resets >= 10  && -getBaseLog(1.075, player.C.LevelC) + 24 >= 1) player.C.CarbonC = player.C.CarbonC -getBaseLog(1.075, player.C.LevelC) + 24  * tmp.N.CB
                if (player.C.XpmaxC <= 0 && player.C.Switch == 5 && -getBaseLog(1.075, player.C.LevelC) + 24 < 1 || player.C.XpmaxC <= 0 && player.N.resets >= 10  && -getBaseLog(1.075, player.C.LevelC) + 24 < 1) player.C.CarbonC = player.C.CarbonC + 1 * tmp.N.CB
                let progC = []
                if (player.C.XpmaxC <= 0 && player.C.Switch == 5 || player.C.XpmaxC <= 0 && player.N.resets >= 10 ) player.C.LevelC = player.C.LevelC + 1, player.C.XpmaxC = player.C.TruemaxC + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelC)*1.7 + 800), player.C.TruemaxC = player.C.XpmaxC, player.C.XpToC = 0
                progC = player.C.XpToC / player.C.TruemaxC
                return progC
            },
            display() { return "CEO" },
            fillStyle() {if (player.C.Switch == 5 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 5 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        PickBar: {
            tooltip() {
                return `You cannot hold any more items.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(6)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.Xpmaxp <= 0 && player.C.Switch == 6 && -getBaseLog(5, player.C.Levelp) + 1.75 >= 0.1 || player.C.Xpmaxp <= 0 && player.N.resets >= 10  && -getBaseLog(5, player.C.Levelp) + 1.75 >= 0.1) player.C.Carbonp = player.C.Carbonp -getBaseLog(5, player.C.Levelp) + 1.75  * tmp.N.CB
                if (player.C.Xpmaxp <= 0 && player.C.Switch == 6 && -getBaseLog(1.45, player.C.Levelp) + 1.75 < 0.1 || player.C.Xpmaxp <= 0 && player.N.resets >= 10  && -getBaseLog(1.45, player.C.Levelp) + 1.75 < 0.1) player.C.Carbonp = player.C.Carbonp + 0.1 * tmp.N.CB
                let progp = []
                if (player.C.Xpmaxp <= 0 && player.C.Switch == 6 || player.C.Xpmaxp <= 0 && player.N.resets >= 10 ) player.C.Levelp = player.C.Levelp + 1, player.C.Xpmaxp = player.C.Truemaxp + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelp)*1.8 + 120), player.C.Truemaxp = player.C.Xpmaxp, player.C.XpTop = 0
                progp = player.C.XpTop / player.C.Truemaxp
                return progp
            },
            display() { return "Pickpocket<div>-0.1 Health" },
            fillStyle() {if (player.C.Switch == 6 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 6 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        Gas: {
            tooltip() {
                return `Robbing a gas station is quite the step up from people's pockets wouldn't you say. With it comes much risk however.`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(7)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxG <= 0 && player.C.Switch == 7 &&  -getBaseLog(1.105, player.C.LevelG) + 19 >= 2 || player.C.XpmaxG <= 0 && player.N.resets >= 10  && -getBaseLog(1.105, player.C.LevelG) + 19 >= 2) player.C.CarbonG = player.C.CarbonG  -getBaseLog(1.105, player.C.LevelG) + 19 * tmp.N.CB
                if (player.C.XpmaxG <= 0 && player.C.Switch == 7 && -getBaseLog(1.105, player.C.LevelG) + 19 < 2 || player.C.XpmaxG <= 0 && player.N.resets >= 10  && -getBaseLog(1.105, player.C.LevelG) + 19 < 2) player.C.CarbonG = player.C.CarbonG  + 2 * tmp.N.CB
                let progG = []
                if (player.C.XpmaxG <= 0 && player.C.Switch == 7 || player.C.XpmaxG <= 0 && player.N.resets >= 10 ) player.C.LevelG = player.C.LevelG + 1, player.C.XpmaxG = player.C.TruemaxG + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelG)*1.8 + 1000), player.C.TruemaxG = player.C.XpmaxG, player.C.XpToG = 0
                progG = player.C.XpToG / player.C.TruemaxG
                return progG
            },
            display() { return "Gas Station<div>-0.4 Health" },
            fillStyle() {if (player.C.Switch == 7 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 7 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        Jewelry: {
            tooltip() {
                return `Heavily reinforced doors, bullet proof glass and many bystanders. High risk, high reward`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(8)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxJ <= 0 && player.C.Switch == 8 &&  -getBaseLog(1.034, player.C.LevelJ) + 48 >= 5 || player.C.XpmaxJ <= 0 && player.N.resets >= 10  && -getBaseLog(1.034, player.C.LevelJ) + 48 >= 5) player.C.CarbonJ = player.C.CarbonJ  -getBaseLog(1.034, player.C.LevelJ) + 48 * tmp.N.CB
                if (player.C.XpmaxJ <= 0 && player.C.Switch == 8 && -getBaseLog(1.034, player.C.LevelJ) + 48 < 5 || player.C.XpmaxJ <= 0 && player.N.resets >= 10  && -getBaseLog(1.034, player.C.LevelJ) + 48 < 5) player.C.CarbonJ = player.C.CarbonJ + 5 * tmp.N.CB
                let progJ = []
                if (player.C.XpmaxJ <= 0 && player.C.Switch == 8 || player.C.XpmaxJ <= 0 && player.N.resets >= 10 ) player.C.LevelJ = player.C.LevelJ + 1, player.C.XpmaxJ = player.C.TruemaxJ + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelJ)*3 + 10000), player.C.TruemaxJ = player.C.XpmaxJ, player.C.XpToJ = 0
                progJ = player.C.XpToJ / player.C.TruemaxJ
                return progJ
            },
            display() { return "Jewelry Store<div>-1 Health" },
            fillStyle() {if (player.C.Switch == 8 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 8 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        BankHeist: {
            tooltip() {
                return `On a dark and gloomy night, you arise from the shadows overlooking the establishment. It's layered with security camera's, security guards and security doors. The chance of success is slim but rewards are plentiful. Will conquer the bank, or will you die trying?`
            },
            onClick(){
                return player.C.Switch = player.C.Switch.times(0).add(9)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                if (player.C.XpmaxB <= 0 && player.C.Switch == 9 &&  -getBaseLog(1.034, player.C.LevelB) + 200 >= 10 || player.C.XpmaxJ <= 0 && player.N.resets >= 10  && -getBaseLog(1.034, player.C.LevelB) + 200 >= 10) player.C.CarbonB = player.C.CarbonB -getBaseLog(1.034, player.C.LevelB) + 200 * tmp.N.CB
                if (player.C.XpmaxB <= 0 && player.C.Switch == 9 && -getBaseLog(1.034, player.C.LevelB) + 200 < 10 || player.C.XpmaxJ <= 0 && player.N.resets >= 10  && -getBaseLog(1.034, player.C.LevelB) + 200 < 10) player.C.CarbonB = player.C.CarbonB + 10 * tmp.N.CB
                let progB = []
                if (player.C.XpmaxB <= 0 && player.C.Switch == 9 || player.C.XpmaxB <= 0 && player.N.resets >= 10) player.C.LevelB = player.C.LevelB + 1, player.C.XpmaxB = player.C.TruemaxB + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelB)*3 + 10000), player.C.TruemaxB = player.C.XpmaxB, player.C.XpToB = 0
                progB = player.C.XpToB / player.C.TruemaxB
                return progB
            },
            display() { return "Bank Heist<div>-2 Health" },
            fillStyle() {if (player.C.Switch == 9 || player.N.resets >= 10 ) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch == 9 || player.N.resets >= 10 ) return {'border-radius': '0'}
            else return {'border-radius': '0%'}},
            
        },
        Focus: {
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(1)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            tooltip() {
                return 'The key is to concentrate. Ready your mind as you research and experiment. The worst yield must always be expected.'
            },
            effect(){
                let effect = []
                effect = player.C.Levelf * 0.01 + 0.01 + 1 - 0.02
                player.C.Xpskill = player.N.Xp * effect * tmp.C.Health
                return effect
            },
            progress() {
                let progF = []
                if (player.C.Xpmaxf <= 0 && player.C.Switch1 == 1 || player.C.Xpmaxf <= 0 && player.N.resets >= 2 && player.C.auto1) player.C.Levelf = player.C.Levelf + 1, player.C.Xpmaxf = player.C.Truemaxf + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelf)*1.9 + 100), player.C.Truemaxf = player.C.Xpmaxf, player.C.XpTof = 0
                progF = player.C.XpTof / player.C.Truemaxf
                return progF
            },
            display() { return "Focus" },
            fillStyle() {if (player.C.Switch1 == 1 || player.N.resets >= 2 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 1 || player.N.resets >= 2 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        JobExperience: {
            tooltip() {
                return `It's about drive, it's about power, we stay hungry, we devour. Put in the work, put in the hours and take what's ours.`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(2)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = []
                effect = player.C.LevelJB * 0.01 + 0.01 + 1 - 0.02
                player.C.Xpptm = player.N.Xp * effect * tmp.C.Health * temp['C'].clickables[23].effect
                return effect
            },
            progress() {
                let progJE = []
                if (player.C.XpmaxJB <= 0 && player.C.Switch1 == 2 || player.C.XpmaxJB <= 0 && player.N.resets >= 3 && player.C.auto1) player.C.LevelJB = player.C.LevelJB + 1, player.C.XpmaxJB = player.C.TruemaxJB + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelJB)*2.1 + 100), player.C.TruemaxJB = player.C.XpmaxJB, player.C.XpToJB = 0
                progJE = player.C.XpToJB / player.C.TruemaxJB
                return progJE
            },
            display() { return "Job Experience" },
            fillStyle() {if (player.C.Switch1 == 2  || player.N.resets >= 3 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 2  || player.N.resets >= 3 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        Persuasion: {
            tooltip() {
                return `Learn the art of persuasion. Have a silver tongue and watch as your expenses trickle away.`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(3)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = 1
                if (effect >= 0.90) effect = 1 + player.C.Levelpe * 0.02 * -1 + 0.02
                if (effect < 0.90) effect = 1 + player.C.Levelpe * 0.01 * -1 - 0.04
                if (effect < 0.85) effect = 1 + player.C.Levelpe * 0.001 * -1 - 0.15
                if (effect < 0.50) effect = 0.5
                return effect
            },
            progress() {
                let progpe = []
                if (player.C.Xpmaxpe <= 0 && player.C.Switch1 == 3 || player.C.Xpmaxpe <= 0 && player.N.resets >= 4 && player.C.auto1) player.C.Levelpe = player.C.Levelpe + 1, player.C.Xpmaxpe = player.C.Truemaxpe + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelpe)*2.4 + 100), player.C.Truemaxpe = player.C.Xpmaxpe, player.C.XpTope = 0
                progpe = player.C.XpTope / player.C.Truemaxpe
                return progpe
            },
            display() { return "Persuasion" },
            fillStyle() {if (player.C.Switch1 == 3  || player.N.resets >= 4 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 3  || player.N.resets >= 4 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        Relaxation: {
            tooltip() {
                return `Find comfort within who you are. Understand that not everyday has to be work filled. Peace comes to those who embrace it.`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(4)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = []
                effect = 1 + player.C.LevelR * 0.01 - 0.01
                return effect
            },
            progress() {
                let progR = []
                if (player.C.XpmaxR <= 0 && player.C.Switch1 == 4 || player.C.XpmaxR <= 0 && player.N.resets >= 5 && player.C.auto1) player.C.LevelR = player.C.LevelR + 1, player.C.XpmaxR = player.C.TruemaxR + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelR)*2.7 + 150), player.C.TruemaxR = player.C.XpmaxR, player.C.XpToR = 0
                progR = player.C.XpToR / player.C.TruemaxR
                return progR
            },
            display() { return "Relaxation" },
            fillStyle() {if (player.C.Switch1 == 4  || player.N.resets >= 5 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 4  || player.N.resets >= 5 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        Dummy: {
            tooltip() {
                return `Easier than stealing candy from a baby!`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(6)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = []
                effect = player.C.LevelD * 0.01 + 0.01 + 1 - 0.02
                return effect
            },
            progress() {
                let progD = []
                if (player.C.XpmaxD <= 0 && player.C.Switch1 == 6 || player.C.XpmaxD <= 0 && player.N.resets >= 6 && player.C.auto1) player.C.LevelD = player.C.LevelD + 1, player.C.XpmaxD = player.C.TruemaxD + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelD)*1.4 + 100), player.C.TruemaxD = player.C.XpmaxD, player.C.XpToD = 0
                progD = player.C.XpToD / player.C.TruemaxD
                return progD
            },
            display() { return "Dummy" },
            fillStyle() {if (player.C.Switch1 == 6  || player.N.resets >= 6 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 6  || player.N.resets >= 6 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        ThievingTactics: {
            tooltip() {
                return `Devise executable plans for your theiving ways.`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(7)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = []
                effect = player.C.Levelt * 0.01 + 0.01 + 1 - 0.02
                return effect
            },
            progress() {
                let progt = []
                if (player.C.Xpmaxt <= 0 && player.C.Switch1 == 7 || player.C.Xpmaxt <= 0 && player.N.resets >= 7 && player.C.auto1) player.C.Levelt = player.C.Levelt + 1, player.C.Xpmaxt = player.C.Truemaxt + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.Levelt)*2 + 100), player.C.Truemaxt = player.C.Xpmaxt, player.C.XpTot = 0
                progt = player.C.XpTot / player.C.Truemaxt
                return progt
            },
            display() { return "Thieving Tatics" },
            fillStyle() {if (player.C.Switch1 == 7  || player.N.resets >= 7 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 7  || player.N.resets >= 7 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
        WeaponsTools: {
            tooltip() {
                return `Improve your artillery of weapons and tools to pull off heists with higher stakes.`
            },
            onClick(){
                return player.C.Switch1 = player.C.Switch1.times(0).add(8)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            effect(){
                let effect = []
                effect = 1 + player.C.LevelW * 0.01 - 0.01
                return effect
            },
            progress() {
                let progW = []
                if (player.C.XpmaxW <= 0 && player.C.Switch1 == 8 || player.C.XpmaxW <= 0 && player.N.resets >= 8 && player.C.auto1) player.C.LevelW = player.C.LevelW + 1, player.C.XpmaxW = player.C.TruemaxW + (player.N.complete.times(player.N.complete.times(5.6)).add(1).times(player.C.LevelW)*2.4 + 200), player.C.TruemaxW = player.C.XpmaxW, player.C.XpToW = 0
                progW = player.C.XpToW / player.C.TruemaxW
                return progW
            },
            display() { return "Weapons/Tools" },
            fillStyle() {if (player.C.Switch1 == 8  || player.N.resets >= 8 && player.C.auto1) return {"background-color": "#00e600"}
            else return {"background-color": "#0000ff"}},
            style() { if (player.C.Switch1 == 8  || player.N.resets >= 8 && player.C.auto1) return {'border-radius': '0%'}
            else return {'border-radius': '0%'}},
            
        },
    },

    clickables: {
        11: {
            style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
            title: "Homeless",
            tooltip() {
                return 'Rough start huh?'
            },
            effect() {
                if (player.C.Switch2 == 1) tmp.C.Health = 1 * tmp.N.HB * temp['C'].clickables[25].effect * player.N.days * temp['C'].bars['Relaxation'].effect - tmp.C.JHealth
            },
            canClick() { return true},
            onClick() {
             player.C.Switch2 = 1
            },
    },
    12: {
        style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
        title: "Cardboard Box",
        canClick() { return true},
        tooltip() {
            return 'Snake, snaaaaaake!'
        },
        effect() {
           if (player.C.Switch2 == 2) tmp.C.Health = 1.5 * tmp.N.HB * temp['C'].clickables[25].effect * player.N.days * temp['C'].bars['Relaxation'].effect - tmp.C.JHealth
        },
        onClick() {
         player.C.Switch2 = 2
        },
},
13: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Wooden Shack",
    canClick() { return true},
    tooltip() {
        return 'Deep in the wooded forest lies a oak wood shack stained by time. The musky smell waftes over you as you take a look at your new home.'
    },
    effect() {
       if (player.C.Switch2 == 3) tmp.C.Health = 2 * tmp.N.HB * temp['C'].clickables[25].effect * player.N.days * temp['C'].bars['Relaxation'].effect - tmp.C.JHealth
    },
    onClick() {
     player.C.Switch2 = 3
    },
},
14: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Merged House",
    canClick() { return true},
    tooltip() {
        return `Fresh off the market, this house can easily support 8 people, though you probably don't have any friends. Gaze over the wooden balcony and feel the height of a second floor!`
    },
    effect() {
       if (player.C.Switch2 == 4) tmp.C.Health = 3.5 * tmp.N.HB * temp['C'].clickables[25].effect * player.N.days * temp['C'].bars['Relaxation'].effect - tmp.C.JHealth
    },
    onClick() {
     player.C.Switch2 = 4
    },
},
15: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Mansion",
    canClick() { return true},
    tooltip() {
        return `An inprint of your success. Lavish rooms, decadent hallways, marble tiling. What's not to love? You can even buy friends if you want!`
    },
    effect() {
       if (player.C.Switch2 == 5) tmp.C.Health = 5 * tmp.N.HB * temp['C'].clickables[25].effect * player.N.days * temp['C'].bars['Relaxation'].effect - tmp.C.JHealth
    },
    onClick() {
     player.C.Switch2 = 5
    },
},
 21: {
            style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
            title: `<div style="font-size": "1px">Encyclopedia</div>`,
            tooltip() {
                return 'Read through a variety of encyclopedias in order to strengthen your knowledge boosting your comprehension on specific skills.'
            },
            effect() {
                if (player.C.Mis1 == 1) effect = 1.5
                else effect = 1
                return effect
            },
            canClick() { return true},
            onClick() {
             if (player.C.Mis1 == 0) player.C.Mis1 = 1, player.C.ME1 = (player.C.ME1 + 2 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div
             else player.C.Mis1 = 0, player.C.ME1 = 0
            },
    },
    22: {
        style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
        title: "Wit",
        tooltip() {
            return 'Chow down on mind games for breakfast. Understand the other with a single glance. Know what they will do and inturn save yourself some time. Intelligence comes at a cost however.'
        },
        effect() {
            if (player.C.Mis2 == 1) effect = 1.5
            else effect = 1
            return effect
        },
        canClick() { return true},
        onClick() {
         if (player.C.Mis2 == 0) player.C.Mis2 = 1, player.C.ME2 = (player.C.ME2 + 10 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div
         else player.C.Mis2 = 0, player.C.ME2 = 0
        },
},
23: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Assistant",
    tooltip() {
        return 'Your own personal lacky. Not that they respect or anything. Infact, they fear you. For the pay that they receive, they feel as though they are stuck in purgatory between quitting and dying to another one of your mandatory 8 hour work session.'
    },
    effect() {
        if (player.C.Mis3 == 1) effect = 2
        else effect = 1
        return effect
    },
    canClick() { return true},
    onClick() {
     if (player.C.Mis3 == 0) player.C.Mis3 = 1, player.C.ME3 = (player.C.ME3 + 30 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div
     else player.C.Mis3 = 0, player.C.ME3 = 0
    },
},
24: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Associate",
    tooltip() {
        return 'I am not turning down the money! I am turning down you! You get it? I want nothing to do with you! Ever since I met you, everything I ever cared about is gone! Ruined, turned to s**t, dead, ever since I hooked up with the great Heisenberg!'
    },
    effect() {
        if (player.C.Mis4 == 1) effect = 2
        else effect = 1
        return effect
    },
    canClick() { return true},
    onClick() {
     if (player.C.Mis4 == 0) player.C.Mis4 = 1, player.C.ME4 = (player.C.ME4 + 150 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div
     else player.C.Mis4 = 0, player.C.ME4 = 0
    },
},
25: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '50px', width: '100px'},
    title: "Friend",
    tooltip() {
        return 'You bought a friend, simple as that.'
    },
    effect() {
        if (player.C.Mis5 == 1) effect = 2
        else effect = 1
        return effect
    },
    canClick() { return true},
    onClick() {
     if (player.C.Mis5 == 0) player.C.Mis5 = 1, player.C.ME5 = (player.C.ME5 + 400 * player.N.days * tmp.N.Five * temp['C'].bars['Persuasion'].effect) * ((player.N.complete * 20.5) + 1) / tmp.N.div
     else player.C.Mis5 = 0, player.C.ME5 = 0
    },
},
31: {
    style: {color: "#ededed", 'border-radius': '0%', 'min-height': '25px', width: '80px'},
    title: "Restart",
    canClick() { return true},
    onClick() {    
        if (player.C.maxptm < player.C.Levelptm) player.C.maxptm = player.C.Levelptm
        if (player.C.maxftm < player.C.Levelftm) player.C.maxftm = player.C.Levelftm
        if (player.C.maxM < player.C.LevelM) player.C.maxM = player.C.LevelM
        if (player.C.maxE < player.C.LevelE) player.C.maxE = player.C.LevelE
        if (player.C.maxC < player.C.LevelC) player.C.maxC = player.C.LevelC
        if (player.C.maxp < player.C.Levelp) player.C.maxp = player.C.Levelp
        if (player.C.maxG < player.C.LevelG) player.C.maxG = player.C.LevelG
        if (player.C.maxJ < player.C.LevelJ) player.C.maxJ = player.C.LevelJ
        if (player.C.maxB < player.C.LevelB) player.C.maxB = player.C.LevelB
        if (player.C.maxf < player.C.Levelf) player.C.maxf = player.C.Levelf
        if (player.C.maxJB < player.C.LevelJB) player.C.maxJB = player.C.LevelJB
        if (player.C.maxpe < player.C.Levelpe) player.C.maxpe = player.C.Levelpe
        if (player.C.maxR < player.C.LevelR) player.C.maxR = player.C.LevelR
        if (player.C.maxD < player.C.LevelD) player.C.maxD = player.C.LevelD
        if (player.C.maxt < player.C.Levelt) player.C.maxt = player.C.Levelt
        if (player.C.maxW < player.C.LevelW) player.C.maxW = player.C.LevelW
player.C.points= new Decimal(0)
player.C.fragements= new Decimal(0)
player.C.Nay= new Decimal(1), 
player.C.No= new Decimal(1),
player.C.Yes= new Decimal(0),
player.C.Lol= 0,
player.C.Switch= new Decimal(0),
player.C.Switch1= new Decimal(0),
player.C.Switch2= new Decimal(1),
player.C.Year= new Decimal(1),
player.C.Day= new Decimal(0),
        player.C.Levelptm= 1
        player.C.Xpmaxptm= 100
        player.C.Truemaxptm= 100
        player.C.Xpptm= 5
        player.C.XpToptm= 0
        player.C.Carbonptm= 5
        player.C.Levelftm= 1
        player.C.Xpmaxftm= 100
        player.C.Truemaxftm= 100
        player.C.XpToftm= 0
        player.C.Carbonftm= 9
        player.C.LevelM= 1
        player.C.XpmaxM= 200
        player.C.TruemaxM= 200
        player.C.XpToM= 0
        player.C.CarbonM= 18
        player.C.LevelE= 1
        player.C.XpmaxE= 600
        player.C.TruemaxE= 600
        player.C.XpToE= 0
        player.C.CarbonE= 52
        player.C.LevelC= 1
        player.C.XpmaxC= 800
        player.C.TruemaxC= 800
        player.C.XpToC= 0
        player.C.CarbonC= 200
        player.C.Levelp= 1
        player.C.Xpmaxp= 100
        player.C.Truemaxp= 100
        player.C.XpTop= 0
        player.C.Carbonp= 9
        player.C.LevelG= 1
        player.C.XpmaxG= 1000
        player.C.TruemaxG= 1000
        player.C.XpToG= 0
        player.C.CarbonG= 66
        player.C.LevelJ= 1
        player.C.XpmaxJ= 10000
        player.C.TruemaxJ= 10000
        player.C.XpToJ= 0
        player.C.CarbonJ= 157
        player.C.LevelB= 1
        player.C.XpmaxB= 10000
        player.C.TruemaxB= 10000
        player.C.XpToB= 0
        player.C.CarbonB= 544
        player.C.Levelf= 1
        player.C.Xpmaxf= 100
        player.C.Truemaxf= 100
        player.C.Xpskill= 5
        player.C.XpTof= 0
        player.C.LevelJB= 1
        player.C.XpmaxJB= 100
        player.C.TruemaxJB= 100
        player.C.XpToJB= 0    
        player.C.Levelpe= 1
        player.C.Xpmaxpe= 200
        player.C.Truemaxpe= 200
        player.C.XpTope= 0
        player.C.LevelR= 1
        player.C.XpmaxR= 50
        player.C.TruemaxR= 50
        player.C.XpToR= 0
        player.C.LevelD= 1
        player.C.XpmaxD= 100
        player.C.TruemaxD= 100
        player.C.XpToD= 0
        player.C.Levelt= 1
        player.C.Xpmaxt= 200
        player.C.Truemaxt= 200
        player.C.XpTot= 0
        player.C.LevelW= 1
        player.C.XpmaxW= 100
        player.C.TruemaxW= 100
        player.C.XpToW= 0
        player.C.Mis1= new Decimal(0)
        player.C.Mis2= new Decimal(0)
        player.C.Mis3= new Decimal(0)
        player.C.Mis4 = new Decimal(0)
        player.C.Mis5 = new Decimal(0)
        player.C.ME1 = 0
        player.C.ME2 = 0
        player.C.ME3 = 0
        player.C.ME4 = 0
        player.C.ME5 = 0
        if (player.C.Res != 3  && player.N.resets == 0) player.C.Res = player.C.Res + 1
        if (player.N.resets > 0) player.C.Res = player.C.Res + 1
        if (player.C.Res == 3 && player.N.resets == 0){
            player.C.Res = 1
            if (!confirm("You're going to lose everything now, Wait, why is there a cancel button? This doesn't feel right at all.")) return ''}
    },
},
32: {
    title: "Reset Your Life",
    display: "Click",
    style: { "background-color": "#0000ff" },
    canClick() {
        return true
    },
    style: { "color": "#ededed" },
    unlocked() {
        if (options.mobileMode == true) return true
        else return false
    },
    onClick() {
        if (player.C.Year >= 30 && hasUpgrade('N', 13)){
            if (player.C.maxptm < player.C.Levelptm) player.C.maxptm = player.C.Levelptm
            if (player.C.maxftm < player.C.Levelftm) player.C.maxftm = player.C.Levelftm
            if (player.C.maxM < player.C.LevelM) player.C.maxM = player.C.LevelM
            if (player.C.maxE < player.C.LevelE) player.C.maxE = player.C.LevelE
            if (player.C.maxC < player.C.LevelC) player.C.maxC = player.C.LevelC
            if (player.C.maxp < player.C.Levelp) player.C.maxp = player.C.Levelp
            if (player.C.maxG < player.C.LevelG) player.C.maxG = player.C.LevelG
            if (player.C.maxJ < player.C.LevelJ) player.C.maxJ = player.C.LevelJ
            if (player.C.maxB < player.C.LevelB) player.C.maxB = player.C.LevelB
            if (player.C.maxf < player.C.Levelf) player.C.maxf = player.C.Levelf
            if (player.C.maxJB < player.C.LevelJB) player.C.maxJB = player.C.LevelJB
            if (player.C.maxpe < player.C.Levelpe) player.C.maxpe = player.C.Levelpe
            if (player.C.maxR < player.C.LevelR) player.C.maxR = player.C.LevelR
            if (player.C.maxD < player.C.LevelD) player.C.maxD = player.C.LevelD
            if (player.C.maxt < player.C.Levelt) player.C.maxt = player.C.Levelt
            if (player.C.maxW < player.C.LevelW) player.C.maxW = player.C.LevelW
    player.C.points= new Decimal(0)
    player.C.fragements= new Decimal(0)
    player.C.Nay= new Decimal(1), 
    player.C.No= new Decimal(1),
    player.C.Yes= new Decimal(0),
    player.C.Lol= 0,
    player.C.Switch= new Decimal(0),
    player.C.Switch1= new Decimal(0),
    player.C.Switch2= new Decimal(1),
    player.C.Year= new Decimal(1),
    player.C.Day= new Decimal(0),
            player.C.Levelptm= 1
            player.C.Xpmaxptm= 100
            player.C.Truemaxptm= 100
            player.C.Xpptm= 5
            player.C.XpToptm= 0
            player.C.Carbonptm= 5
            player.C.Levelftm= 1
            player.C.Xpmaxftm= 100
            player.C.Truemaxftm= 100
            player.C.XpToftm= 0
            player.C.Carbonftm= 9
            player.C.LevelM= 1
            player.C.XpmaxM= 200
            player.C.TruemaxM= 200
            player.C.XpToM= 0
            player.C.CarbonM= 18
            player.C.LevelE= 1
            player.C.XpmaxE= 600
            player.C.TruemaxE= 600
            player.C.XpToE= 0
            player.C.CarbonE= 52
            player.C.LevelC= 1
            player.C.XpmaxC= 800
            player.C.TruemaxC= 800
            player.C.XpToC= 0
            player.C.CarbonC= 200
            player.C.Levelp= 1
            player.C.Xpmaxp= 100
            player.C.Truemaxp= 100
            player.C.XpTop= 0
            player.C.Carbonp= 9
            player.C.LevelG= 1
            player.C.XpmaxG= 1000
            player.C.TruemaxG= 1000
            player.C.XpToG= 0
            player.C.CarbonG= 66
            player.C.LevelJ= 1
            player.C.XpmaxJ= 10000
            player.C.TruemaxJ= 10000
            player.C.XpToJ= 0
            player.C.CarbonJ= 157
            player.C.LevelB= 1
            player.C.XpmaxB= 10000
            player.C.TruemaxB= 10000
            player.C.XpToB= 0
            player.C.CarbonB= 544
            player.C.Levelf= 1
            player.C.Xpmaxf= 100
            player.C.Truemaxf= 100
            player.C.Xpskill= 5
            player.C.XpTof= 0
            player.C.LevelJB= 1
            player.C.XpmaxJB= 100
            player.C.TruemaxJB= 100
            player.C.XpToJB= 0    
            player.C.Levelpe= 1
            player.C.Xpmaxpe= 200
            player.C.Truemaxpe= 200
            player.C.XpTope= 0
            player.C.LevelR= 1
            player.C.XpmaxR= 50
            player.C.TruemaxR= 50
            player.C.XpToR= 0
            player.C.LevelD= 1
            player.C.XpmaxD= 100
            player.C.TruemaxD= 100
            player.C.XpToD= 0
            player.C.Levelt= 1
            player.C.Xpmaxt= 200
            player.C.Truemaxt= 200
            player.C.XpTot= 0
            player.C.LevelW= 1
            player.C.XpmaxW= 100
            player.C.TruemaxW= 100
            player.C.XpToW= 0
            player.C.Mis1= new Decimal(0)
            player.C.Mis2= new Decimal(0)
            player.C.Mis3= new Decimal(0)
            player.C.Mis4 = new Decimal(0)
            player.C.Mis5 = new Decimal(0)
            player.C.ME1 = 0
            player.C.ME2 = 0
            player.C.ME3 = 0
            player.C.ME4 = 0
            player.C.ME5 = 0
            if (player.C.Res != 3  && player.N.resets == 0) player.C.Res = player.C.Res + 1
            if (player.N.resets > 0) player.C.Res = player.C.Res + 1}},
        },
        41: {
            style: {color: "#ededed", 'border-radius': '44%'},
            title: "Screw That! Screw You!",
            canClick() { return true},
            unlocked() {
                if (player.C.No <= 0) return true
            },
            onClick() {
             player.C.No = 1
            },
    },
},

    infoboxes: {
        lore: {
            titleStyle: { "color": "#ededed" },
            title: "Carbon",
            body() { return "Alright, cool, cool, cool. Now, I'm going to need you to get employed in a mining company. Start mining some carbon-rich rock- I mean minerals." },
        },
        lore1: {
            titleStyle: { "color": "#ededed" },
            title: "Carbon",
            body() { return "Alright, cool, cool, cool. Now, I'm going to need you to get employed in a mining company. Start mining some carbon-rich rock- I mean minerals. Fuck!" },
        },
    },

    tabFormat: {
        "MainTab": {
            content: [
                () => (options.matureMode == false) ? ['infobox', 'lore'] : ['infobox', 'lore1'],
                    ['clickable', 32],
                    ['clickable', 41],  
                    ['display-text',
                    function() { if (hasMilestone('N', 3)) return '<h2>You have ' + formatWhole(player.N.complete) + ' completon(s) and need ' + formatWhole(100 * (player.N.complete.times(player.N.complete).times(3).add(1))) + ' of all Jobs and Skills for ' + formatWhole(tmp.N.CG) +' more completion(s).</h2>'}],                 
                ['display-text',
                function() { return 'Random Stats That Nobody Cares About (RSTNCA): <div> Total Days: ' + formatWhole(player.C.TotalD) + '<div> Total Years: ' + formatWhole(player.C.TotalY) + '<div> Total Carbon Fragments: <span style="color: #00e600">' + formatWhole(player.C.TotalCf) + 'g</span><div> Total Carbon: <span style="color: #00e600">' + formatWhole(player.C.TotalC) + 'g</span><div>Total Resets: ' + formatWhole(player.C.Res)}],
                "blank",
                ['display-text', 
                function() { if (player.C.No >= 1 && player.C.Res == 0 && options.matureMode == false) return "Ok, wow. Screw you too. What are you going do to then? Rob a bank? Heh, get a load of this guy. Ok fine, we'll go with your plan, genius. Go rob a bank."}],
                ['display-text', 
                function() { if (player.C.No >= 1 && player.C.Res == 0 && options.matureMode == true) return "Ok, wow. Fuck you too. What are you going do to then? Rob a bank? Heh, get a load of this guy. Ok fine, we'll go with your plan, genius. Go rob a bank, bitch."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 0 && player.N.resets == 0) return "Uh, on your 10th anniversary of doing whatever you do, you got icecream or something."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 2 && player.C.Res == 0 && player.N.resets == 0) return "20 years in, 20 years down the drain. Keep going buddy. What? You expected me to talk about some sort of thing you did or something?"}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 3 && player.C.Res == 0 && player.N.resets == 0) return "Alright no more games, you died. It doesn't matter how, you just did. Now you'll have to restart from the beginning but hey, atleast you'll be boosted by your max levels. I'm gonna like 100 Levels on all the Jobs and Skills. Just hit the button below to start fresh, nothing broken. Muliplier formula is: log1000(Resets) + 1 + Job/Skill / 10"}],
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 0 && player.N.resets >= 1) return "Back for more huh, this one sure is a glutton for punishment."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 2 && player.C.Res == 0 && player.N.resets >= 1) return "Keep going, Nitrogen awaits."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 3 && player.C.Res == 0 && player.N.resets >= 1) return "Ok, yada, yada, yada, I'm gonna need like 100 Levels on all the Jobs and Skills yada, yada, yada, muliplier formula is: log1000(Resets) + Total Nitrogen + 1 + Job/Skill / 10"}],
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 1 && player.N.resets == 0) return "Alright round two baby let's go. I want to see you move, hustle man."}],
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 1 && player.N.resets >= 1) return "Alright this is the last stuff I'll say here, just get back to Nirogen, no reset stuff."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 2 && player.C.Res == 1 && player.N.resets == 0) return "I'll actually say what you did this time. You went to your local hardware store and bought a plank so you could stand outside said store and take a quick picture. Kinda weird."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 3 && player.C.Res == 1 && player.N.resets == 0) return "Ok, so you died, again... third times the charm I guess. Remember 100 Levels on each Job/Skill. Muliplier formula is: log1000(Resets) + 1 + Job/Skill / 10"}],
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 2 && player.N.resets == 0) return "This time is for real. No joke, no failure, no choice. I am literaly counting on you here."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 2 && player.C.Res == 2 && player.N.resets == 0) return "You gotta step it up man. This is really dragging and not in a good way. We don't got all day ya know?"}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 3 && player.C.Res == 2 && player.N.resets == 0) return "Ya know, sometimes I guess ya just need a bit of motivation. How about this, get through it on this reset or you'll lose <h3 style='color: #ff0000'> ALL YOUR PROGRESS.</h3> 100 Levels Job/Skill, muliplier formula is: log1000(Resets) + 1 + Job/Skill / 10"}],
                ['display-text', 
                function() { if (player.C.Lol >= 1 && player.C.Res == 3 && player.N.resets == 0) return "Tick tock man, one third in and you should already be done. You're gonna see your progress gonzo soon."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 2 && player.C.Res == 3 && player.N.resets == 0) return "Dude... pick up the pace damn it. PICK UP THE PACE."}],
                "blank",
                ['display-text', 
                function() { if (player.C.Lol >= 3 && player.C.Res == 3 && player.N.resets == 0) return "Heh, guess that's it huh. Well, I guess that's the point of stakes. Climb back up I guess. I'll see you soon."}],
                () => (player.C.Lol >= 3 && !hasUpgrade('N', 13)) ? ['clickable', 31] : "",
            ]
        },
        "Jobs": {
            content: [
                "blank",
                ['display-text', 
                function() { return '<h3>Year: ' + formatWhole(player.C.Year) + ' Day: ' + formatWhole(player.C.Day) + '</h3>'}],
                "blank",
                ['display-text', 
                function() { 
                    if (!hasUpgrade('N', 13) && player.C.Year < 30) return `<span style="color: #70716B"> You'll die at 30 years, view the MainTab for Updates</span>`
                    if (!hasUpgrade('N', 13) && player.C.Year == 30) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`
                    if (hasUpgrade('N', 13) && player.C.Year < 70) return `<span style="color: #70716B"> You'll die at 70 years or when you press D after 30 years, view the MainTab for Updates</span>`
                    if (hasUpgrade('N', 13) && player.C.Year == 70) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`}],
                "blank",
                'Job-grid',
                "blank",
                'Job1-grid',
                ['display-text', '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                ['display-text',
                    function() { if (player.C.Levelptm < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Part-time Miner level ' + formatWhole(player.C.Levelptm) + '/10</span>'}],
                "blank",
                () => (player.C.Levelptm >= 10 || player.N.resets >= 10) ? 'Job2-grid' : "",
                ['display-text', 
                    function() { if (player.C.Levelptm >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text',
                    function() { if (player.C.Levelptm >= 10 && player.C.Levelftm < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Full-time Miner level ' + formatWhole(player.C.Levelftm) + '/10</span>'}],
                () => (player.C.Levelftm >= 10 || player.N.resets >= 10) ? "blank" : "",
                () => (player.C.Levelftm >= 10 || player.N.resets >= 10) ? 'Job3-grid' : "",
                ['display-text', 
                    function() { if (player.C.Levelftm >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text',
                    function() { if (player.C.Levelftm >= 10 && player.C.LevelD < 10 && player.N.resets < 10 || player.C.Levelftm >= 10 && player.C.LevelM < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Dummy level ' + formatWhole(player.C.LevelD) + '/10 and Mine Manager level ' + formatWhole(player.C.LevelM) + '/10</span>'}],
                    () => (player.C.LevelD >= 10 && player.C.LevelM >= 10 || player.N.resets >= 10) ? "blank" : "",
                    () => (player.C.LevelD >= 10 && player.C.LevelM >= 10 || player.N.resets >= 10) ? 'Job4-grid' : "",
                    ['display-text', 
                        function() { if (player.C.LevelD >= 10 && player.C.LevelM >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    ['display-text',
                        function() { if (player.C.LevelM >= 10 && player.C.LevelD >= 10 && player.C.LevelD < 30 && player.N.resets < 10 || player.C.LevelM >= 10 && player.C.LevelD >= 10 && player.C.LevelE < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Dummy level ' + formatWhole(player.C.LevelD) + '/30 and Excutive Vise President level ' + formatWhole(player.C.LevelE) + '/10</span>'}],
                        () => (player.C.LevelE >= 10 && player.C.LevelD >= 30 || player.N.resets >= 10) ? "blank" : "",
                    () => (player.C.LevelE >= 10 && player.C.LevelD >= 30 || player.N.resets >= 10) ? 'Job5-grid' : "",
                    ['display-text', 
                        function() { if (player.C.LevelE >= 10 && player.C.LevelD >= 30 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    "blank",
                    () => (player.C.No >= 1) ? "Job-gridz" : "",
                ['display-text',
                function() { if (player.C.No >= 1 && player.C.LevelD < 5 && player.N.resets < 10) return '<span style="color: #70716B">Required: Dummy level ' + formatWhole(player.C.LevelD) + '/5</span>'}],
                () => (player.C.LevelD >= 5 || player.N.resets >= 10) ? "blank" : "",
                () => (player.C.LevelD >= 5 || player.N.resets >= 10) ? 'Job6-grid' : "",
                ['display-text', 
                    function() { if (player.C.LevelD >= 5 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text',
                    function() { if (player.C.LevelD >= 5 && player.C.LevelD < 20 && player.N.resets < 10|| player.C.LevelD >= 5 && player.C.Levelp < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Dummy level ' + formatWhole(player.C.LevelD) + '/20 and Pickpocket level ' + formatWhole(player.C.Levelp) + '/10</span>'}],
                    () => (player.C.LevelD >= 20 && player.C.Levelp >= 10 || player.N.resets >= 10) ? "blank" : "",
                    () => (player.C.LevelD >= 20 && player.C.Levelp >= 10 || player.N.resets >= 10) ? 'Job7-grid' : "",
                    ['display-text', 
                        function() { if (player.C.LevelD >= 20 && player.C.Levelp >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    ['display-text',
                        function() { if (player.C.LevelD >= 20 && player.C.Levelp >= 10 && player.C.Levelt < 40 && player.N.resets < 10 || player.C.LevelD >= 20 && player.C.Levelp >= 10 && player.C.LevelG < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Thieving Tactics level ' + formatWhole(player.C.Levelt) + '/40 and Gas Station level ' + formatWhole(player.C.LevelG) + '/10</span>'}],
                         () => (player.C.Levelt >= 40 && player.C.LevelG >= 10 || player.N.resets >= 10) ? "blank" : "",
                    () => (player.C.Levelt >= 40 && player.C.LevelG >= 10 || player.N.resets >= 10) ? 'Job8-grid' : "",
                    ['display-text', 
                        function() { if (player.C.Levelt >= 40 && player.C.LevelG >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    ['display-text',
                        function() { if (player.C.Levelt >= 40 && player.C.LevelG >= 10 && player.C.LevelD < 100 && player.N.resets < 10 || player.C.Levelt >= 40 && player.C.LevelG >= 10 && player.C.LevelJ < 10 && player.N.resets < 10) return '<span style="color: #70716B">Required: Dummy level ' + formatWhole(player.C.LevelD) + '/100 and Jewelry Store level ' + formatWhole(player.C.LevelJ) + '/10</span>'}],
                        () => (player.C.LevelD >= 100 && player.C.LevelJ >= 10 || player.N.resets >= 10) ? "blank" : "",
                        () => (player.C.LevelD >= 100 && player.C.LevelJ >= 10 || player.N.resets >= 10) ? 'Job9-grid' : "",
                        ['display-text', 
                            function() { if (player.C.LevelD >= 100 && player.C.LevelJ >= 10 || player.N.resets >= 10) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                "blank",
                ['display-text', 
                function() { return 'You have <span style="color: #00e600">' + formatWhole(player.C.fragements) + 'g</span> of Carbon Fragments<div> <span style="color: #00e600">1000g</span> of Carbon Fragments = <span style="color: #00e600">1g</span> of Carbon'}],
            ]
        },
        "Skills": {
            content: [
                "blank",
                ['display-text', 
                function() { return '<h3>Year: ' + formatWhole(player.C.Year) + ' Day: ' + formatWhole(player.C.Day) + '</h3>'}],
                "blank",
                ['display-text', 
                function() { 
                    if (!hasUpgrade('N', 13) && player.C.Year < 30) return `<span style="color: #70716B"> You'll die at 30 years, view the MainTab for Updates</span>`
                    if (!hasUpgrade('N', 13) && player.C.Year == 30) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`
                    if (hasUpgrade('N', 13) && player.C.Year < 70) return `<span style="color: #70716B"> You'll die at 70 years or when you press D after 30 years, view the MainTab for Updates</span>`
                    if (hasUpgrade('N', 13) && player.C.Year == 70) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`}],
                "blank",
                'Skill-grid',
                "blank",
                'Skill1-grid',
                ['display-text', '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                "blank",
                'Skill2-grid',
                ['display-text', '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                ['display-text',
                    function() { if (player.C.Levelf < 20 && player.N.resets < 4) return '<span style="color: #70716B">Required: Focus level ' + formatWhole(player.C.Levelf) + '/20</span>'}],
                    () => (player.C.Levelf >= 20 || player.N.resets >= 4) ? "blank" : "",
                () => (player.C.Levelf >= 20 || player.N.resets >= 4) ? 'Skill3-grid' : "",
                ['display-text', 
                    function() { if (player.C.Levelf >= 20 || player.N.resets >= 4) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    ['display-text',
                    function() { if (player.C.Levelf >= 20 && player.C.Levelf < 30 && player.N.resets < 5 ||  player.C.Levelf >= 20 && player.C.LevelJB < 20 && player.N.resets < 5) return '<span style="color: #70716B">Required: Focus level ' + formatWhole(player.C.Levelf) + '/30 and Job Experience level ' + formatWhole(player.C.LevelJB) + '/20</span>'}],
                    () => (player.C.Levelf >= 30 &&  player.C.LevelJB >= 20 || player.N.resets >= 5) ? "blank" : "",
                    () => (player.C.Levelf >= 30 &&  player.C.LevelJB >= 20 || player.N.resets >= 5) ? 'Skill4-grid' : "",
                    ['display-text', 
                        function() { if (player.C.Levelf >= 30 && player.C.LevelJB >= 20 || player.N.resets >= 5) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    "blank",
                    () => (player.C.No >= 1) ? "Skillz-grid" : "",
                    () => (player.C.No >= 1) ? "blank" : "",
                () => (player.C.No >= 1) ? 'Skill6-grid' : "",
                ['display-text', 
                    function()  {if (player.C.No >= 1) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    () => (player.C.No >= 1 && player.C.Levelf >= 20 || player.N.resets >= 7) ? "blank" : "",
                    ['display-text',
                    function() { if (player.C.No >= 1 && player.C.Levelf < 20 && player.N.resets < 7) return '<span style="color: #70716B">Required: Focus level ' + formatWhole(player.C.Levelf) + '/20</span>'}],
                () => (player.C.No >= 1 && player.C.Levelf >= 20 || player.N.resets >= 7) ? 'Skill7-grid' : "",
                ['display-text', 
                    function()  {if (player.C.No >= 1 && player.C.Levelf >= 20 || player.N.resets >= 7) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                    ['display-text',
                    function() { if (player.C.No >= 1 && player.C.Levelf >= 20 && player.C.Levelf < 30 && player.N.resets < 8 || player.C.No >= 1 && player.C.Levelf >= 20 && player.C.LevelD < 30 && player.N.resets < 8) return '<span style="color: #70716B">Required: Focus level ' + formatWhole(player.C.Levelf) + '/30 and Dummy level ' + formatWhole(player.C.LevelD) + '/30</span>'}],
                    () => (player.C.No >= 1 && player.C.Levelf >= 30 && player.C.LevelD >= 30 || player.N.resets >= 8) ? "blank" : "",
                    () => (player.C.No >= 1 && player.C.Levelf >= 30 && player.C.LevelD >= 30 || player.N.resets >= 8) ? 'Skill8-grid' : "",
                    ['display-text', 
                        function()  {if (player.C.No >= 1 && player.C.Levelf >= 30 && player.C.LevelD >= 30 || player.N.resets >= 8) return '<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
            ]
        },
        "Shop": {
            content: [
                "blank",
                ['display-text', 
                function() { return '<h3>Year: ' + formatWhole(player.C.Year) + ' Day: ' + formatWhole(player.C.Day) + '</h3>'}],
                ['display-text', 
                function() { 
                    if (!hasUpgrade('N', 13) && player.C.Year < 30) return `<span style="color: #70716B"> You'll die at 30 years, view the MainTab for Updates</span>`
                    if (!hasUpgrade('N', 13) && player.C.Year == 30) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`
                    if (hasUpgrade('N', 13) && player.C.Year < 70) return `<span style="color: #70716B"> You'll die at 70 years or when you press D after 30 years, view the MainTab for Updates</span>`
                    if (hasUpgrade('N', 13) && player.C.Year == 70) return `<span style="color: #70716B"> You died, view the MainTab NOW</span>`}],
                "blank",
                ['display-text', '<b>&nbsp&nbsp&nbsp&nbsp<span style="background-color: #009d94">&nbsp&nbspProperties&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspActive&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspEffect&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCarbon/day&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>&nbsp</b>'],
                "blank",
                'Shop1-grid',
                ['display-text', '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                "blank",
                'Shop2-grid',
                ['display-text', '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                ['display-text', 
                function() { if (player.C.Nay < 2 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">1g</span> of Carbon</span>'}],
                () => (player.C.Nay >= 2 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Nay >= 2 || hasUpgrade('N', 15)) ? 'Shop3-grid' : "",
                ['display-text', 
                function() { if (player.C.Nay > 1 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text', 
                function() { if (player.C.Nay >= 2 && player.C.Nay < 3 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">10g</span> of Carbon</span>'}],
                () => (player.C.Nay >= 3 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Nay >= 3 || hasUpgrade('N', 15)) ? 'Shop4-grid' : "",
                ['display-text', 
                function() { if (player.C.Nay >= 3 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text', 
                function() { if (player.C.Nay >= 3 && player.C.Nay < 4 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">100g</span> of Carbon</span>'}],
                () => (player.C.Nay >= 4 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Nay >= 4 || hasUpgrade('N', 15)) ? 'Shop5-grid' : "",
                ['display-text', 
                function() { if (player.C.Nay >= 4 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                "blank",
                ['display-text', '<b>&nbsp&nbsp&nbsp&nbsp<span style="background-color: #800080">&nbsp&nbspMisc&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspActive&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspEffect&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCarbon/day&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>&nbsp</b>'],
                "blank",
                'Shop6-grid',
                ['display-text', '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                "blank",
                'Shop7-grid',
                ['display-text', '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'],
                ['display-text', 
                function() { if (player.C.Yes < 1 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">2g</span> of Carbon</span>'}],
                () => (player.C.Yes >= 1 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Yes >= 1 || hasUpgrade('N', 15)) ? 'Shop8-grid' : "",
                ['display-text', 
                function() { if (player.C.Yes >= 1 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text', 
                function() { if (player.C.Yes >= 1 && player.C.Yes < 2 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">20g</span> of Carbon</span>'}],
                () => (player.C.Yes >= 2 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Yes >= 2 || hasUpgrade('N', 15)) ? 'Shop9-grid' : "",
                ['display-text', 
                function() { if (player.C.Yes >= 2 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
                ['display-text', 
                function() { if (player.C.Yes >= 2 && player.C.Yes < 3 && !hasUpgrade('N', 15)) return '<span style="color: #70716B">Required: <span style="color: #70716B">200g</span> of Carbon</span>'}],
                () => (player.C.Yes >= 3 || hasUpgrade('N', 15)) ? "blank" : "",
                () => (player.C.Yes >= 3 || hasUpgrade('N', 15)) ? 'Shop10-grid' : "",
                ['display-text', 
                function() { if (player.C.Yes >= 3 || hasUpgrade('N', 15)) return '&nbsp&nbsp&nbsp&nbsp<u style="color: #70716B">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</u>'}],
            ]
        }
    },

    update() {
        if (player.C.Switch == 0) tmp.C.OnOff = tmp.C.OnOff.times(0) 
        if (player.B.Next.gte(1)) player.C.unlocked = true
        tmp.C.Net = tmp.C.Income - tmp.C.Expenses * (5 - tmp.N.Zero)
 if (tmp.C.OnOff == 1) player.C.Ticks = player.C.Ticks.add(1)
 if (tmp.C.OnOff == 1 && player.C.Ticks.gte(player.C.ticks)) player.C.Ticks = player.C.Ticks.times(0), player.C.Day = player.C.Day.add(player.N.days), player.C.TotalD = player.C.TotalD.add(player.N.days)
 if (tmp.C.OnOff == 1 && player.C.Day >= 365) player.C.Day = player.C.Day.times(0), player.C.Year = player.C.Year.add(1), player.C.TotalY = player.C.TotalY.add(1)

 if (player.C.Switch2 == 1) tmp.C.Expenses = 0 + player.C.ME1 + player.C.ME2 + player.C.ME3 + player.C.ME4 + player.C.ME5
 if (player.C.Switch2 == 2) tmp.C.Expenses = ((3 * player.N.days * tmp.N.Five * temp['C'].bars['Persuasion'].effect) * ((player.N.complete * 20.5) + 1) / tmp.N.div) + player.C.ME1 + player.C.ME2 + player.C.ME3 + player.C.ME4 + player.C.ME5
 if (player.C.Switch2 == 3) tmp.C.Expenses = ((20 * player.N.days * ((player.N.complete * 20.5) + 1) * tmp.N.Five * temp['C'].bars['Persuasion'].effect) / tmp.N.div) + player.C.ME1 + player.C.ME2 + player.C.ME3 + player.C.ME4 + player.C.ME5
 if (player.C.Switch2 == 4) tmp.C.Expenses = ((100 * player.N.days * ((player.N.complete * 20.5) + 1) * tmp.N.Five * temp['C'].bars['Persuasion'].effect) / tmp.N.div) + player.C.ME1 + player.C.ME2 + player.C.ME3 + player.C.ME4 + player.C.ME5
 if (player.C.Switch2 == 5) tmp.C.Expenses = ((200 * player.N.days * ((player.N.complete * 20.5) + 1) * tmp.N.Five * temp['C'].bars['Persuasion'].effect) / tmp.N.div) + player.C.ME1 + player.C.ME2 + player.C.ME3 + player.C.ME4 + player.C.ME5

 if (tmp.C.OnOff == 1 && player.C.Switch == 1 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.Carbonptm * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.Xpmaxptm = player.C.Xpmaxptm - player.C.Xpptm * tmp.C.eptm, player.C.XpToptm = player.C.XpToptm + player.C.Xpptm * tmp.C.eptm, player.C.TotalCf = player.C.TotalCf.add(player.C.Carbonptm * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 2 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.Carbonftm * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.Xpmaxftm = player.C.Xpmaxftm - player.C.Xpptm * tmp.C.eftm, player.C.XpToftm = player.C.XpToftm + player.C.Xpptm * tmp.C.eftm, player.C.TotalCf = player.C.TotalCf.add(player.C.Carbonftm * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 3 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonM  * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxM = player.C.XpmaxM - player.C.Xpptm * tmp.C.eM, player.C.XpToM = player.C.XpToM + player.C.Xpptm * tmp.C.eM, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonM * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 4 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonE * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxE = player.C.XpmaxE - player.C.Xpptm * tmp.C.eE, player.C.XpToE = player.C.XpToE + player.C.Xpptm * tmp.C.eE, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonE * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 5 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonC * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxC = player.C.XpmaxC - player.C.Xpptm * tmp.C.eC, player.C.XpToC = player.C.XpToC + player.C.Xpptm * tmp.C.eC, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonC * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 6 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.Carbonp * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.Xpmaxp = player.C.Xpmaxp - player.C.Xpptm * tmp.C.ep * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.XpTop = player.C.XpTop + player.C.Xpptm * tmp.C.ep * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.TotalCf = player.C.TotalCf.add(player.C.Carbonp * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 7 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonG * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxG = player.C.XpmaxG - player.C.Xpptm * tmp.C.eG * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.XpToG = player.C.XpToG + player.C.Xpptm * tmp.C.eG * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonG * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 8 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonJ * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxJ = player.C.XpmaxJ - player.C.Xpptm * tmp.C.eJ * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.XpToJ = player.C.XpToJ + player.C.Xpptm * tmp.C.eJ * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonJ * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks)
 if (tmp.C.OnOff == 1 && player.C.Switch == 9 || tmp.C.OnOff == 1 && player.N.resets >= 10) player.C.fragements = player.C.fragements.add((player.C.CarbonB * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks) - (tmp.C.Expenses / tmp.N.div1)), player.C.XpmaxB = player.C.XpmaxB - player.C.Xpptm * tmp.C.eB * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.XpToB = player.C.XpToB + player.C.Xpptm * tmp.C.eB * temp['C'].clickables[24].effect * temp['C'].bars['ThievingTactics'].effect, player.C.TotalCf = player.C.TotalCf.add(player.C.CarbonJ * temp['C'].bars['Dummy'].effect * player.N.days / player.C.ticks)

 if (tmp.C.OnOff == 1 && player.C.Switch1 == 1 || tmp.C.OnOff == 1 && player.N.resets >= 2 && player.C.auto1) player.C.Xpmaxf = player.C.Xpmaxf - player.C.Xpskill * tmp.C.ef * temp['C'].clickables[21].effect, player.C.XpTof = player.C.XpTof + player.C.Xpskill * tmp.C.ef * temp['C'].clickables[21].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 2 || tmp.C.OnOff == 1 && player.N.resets >= 3 && player.C.auto1) player.C.XpmaxJB = player.C.XpmaxJB - player.C.Xpskill * tmp.C.eJB * temp['C'].clickables[21].effect, player.C.XpToJB = player.C.XpToJB + player.C.Xpskill * tmp.C.eJB * temp['C'].clickables[21].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 3 || tmp.C.OnOff == 1 && player.N.resets >= 4 && player.C.auto1) player.C.Xpmaxpe = player.C.Xpmaxpe - player.C.Xpskill * tmp.C.epe * temp['C'].clickables[21].effect, player.C.XpTope = player.C.XpTope + player.C.Xpskill * tmp.C.epe * temp['C'].clickables[21].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 4 || tmp.C.OnOff == 1 && player.N.resets >= 5 && player.C.auto1) player.C.XpmaxR = player.C.XpmaxR - player.C.Xpskill * tmp.C.eR * temp['C'].clickables[21].effect, player.C.XpToR = player.C.XpToR + player.C.Xpskill * tmp.C.eR * temp['C'].clickables[21].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 6 || tmp.C.OnOff == 1 && player.N.resets >= 6 && player.C.auto1) player.C.XpmaxD = player.C.XpmaxD - player.C.Xpskill * tmp.C.eD * temp['C'].clickables[22].effect * temp['C'].clickables[21].effect * temp['C'].bars['WeaponsTools'].effect, player.C.XpToD = player.C.XpToD + player.C.Xpskill * tmp.C.eD * temp['C'].clickables[22].effect * temp['C'].clickables[21].effect * temp['C'].bars['WeaponsTools'].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 7 || tmp.C.OnOff == 1 && player.N.resets >= 7 && player.C.auto1) player.C.Xpmaxt = player.C.Xpmaxt - player.C.Xpskill * tmp.C.et * temp['C'].clickables[21].effect, player.C.XpTot = player.C.XpTot + player.C.Xpskill * tmp.C.et * temp['C'].clickables[21].effect
 if (tmp.C.OnOff == 1 && player.C.Switch1 == 8 || tmp.C.OnOff == 1 && player.N.resets >= 8 && player.C.auto1) player.C.XpmaxW = player.C.XpmaxW - player.C.Xpskill * tmp.C.eW * temp['C'].clickables[21].effect, player.C.XpToW = player.C.XpToW + player.C.Xpskill * tmp.C.eW * temp['C'].clickables[21].effect

 if (player.C.Switch == 0 && player.N.resets < 10)  tmp.C.Income = 0, tmp.C.JHealth = 0
 if (player.C.Switch == 1 && player.N.resets < 10)  tmp.C.Income = player.C.Carbonptm * player.N.days, tmp.C.JHealth = 0.2 
 if (player.C.Switch == 2 && player.N.resets < 10)  tmp.C.Income = player.C.Carbonftm * player.N.days, tmp.C.JHealth = 0.5
 if (player.C.Switch == 3 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonM * player.N.days, tmp.C.JHealth = 0.3
 if (player.C.Switch == 4 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonE * player.N.days, tmp.C.JHealth = 0
 if (player.C.Switch == 5 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonC * player.N.days, tmp.C.JHealth = 0
 if (player.C.Switch == 6 && player.N.resets < 10)  tmp.C.Income = player.C.Carbonp * player.N.days * temp['C'].bars['Dummy'].effect, tmp.C.JHealth = 0.1
 if (player.C.Switch == 7 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonG * player.N.days * temp['C'].bars['Dummy'].effect, tmp.C.JHealth = 0.4
 if (player.C.Switch == 8 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonJ * player.N.days * temp['C'].bars['Dummy'].effect, tmp.C.JHealth = 1
 if (player.C.Switch == 9 && player.N.resets < 10)  tmp.C.Income = player.C.CarbonB * player.N.days * temp['C'].bars['Dummy'].effect, tmp.C.JHealth = 2

 if (player.N.resets >= 10)  tmp.C.Income = player.C.Carbonptm * player.N.days + player.C.Carbonftm * player.N.days + player.C.CarbonM * player.N.days + player.C.CarbonE * player.N.days + player.C.CarbonC * player.N.days + player.C.Carbonp * player.N.days * temp['C'].bars['Dummy'].effect + player.C.CarbonG * player.N.days * temp['C'].bars['Dummy'].effect + player.C.CarbonJ * player.N.days * temp['C'].bars['Dummy'].effect + player.C.CarbonB * player.N.days * temp['C'].bars['Dummy'].effect, tmp.C.JHealth = 4.5
 
 if (player.C.fragements.gte(1000)) player.C.points = player.C.points.add(player.C.fragements / 1000), player.C.TotalC = player.C.TotalC.add(player.C.fragements / 1000), player.C.fragements = player.C.fragements.times(0)
 if (player.C.fragements.lt(0) && player.C.points.gt(0)) player.C.points = player.C.points.add((player.C.fragements - 1000) / 1000), player.C.fragements = player.C.fragements.times(-1).add(1000)
 if (player.C.fragements.lte(0) && player.C.points.lte(0)) player.C.points = player.C.points.times(0), player.C.fragements = player.C.fragements.times(0), player.C.Switch2 = 1, player.C.Mis1 = 0, player.C.Mis2 = 0, player.C.Mis3 = 0, player.C.Mis4 = 0, player.C.Mis5 = 0, player.C.ME1 = 0, player.C.ME2 = 0, player.C.ME3 = 0, player.C.ME4 = 0, player.C.ME5 = 0

 if (player.C.points >= 1 && player.C.Nay == 1) player.C.Nay = 2
 if (player.C.points >= 10 && player.C.Nay == 2) player.C.Nay = 3
 if (player.C.points >= 100 && player.C.Nay == 3) player.C.Nay = 4
 if (player.C.points >= 2 && player.C.Yes == 0) player.C.Yes = 1
 if (player.C.points >= 20 && player.C.Yes == 1) player.C.Yes = 2
 if (player.C.points >= 200 && player.C.Yes == 2) player.C.Yes = 3

 if (player.C.Year.gte(10) && player.C.Lol == 0) player.C.Lol = 1
 if (player.C.Year.gte(20) && player.C.Lol == 1) player.C.Lol = 2
 if (player.C.Year.gte(30) && player.C.Lol == 2 && !hasUpgrade('N', 13)) player.C.Lol = 3, tmp.C.OnOff = tmp.C.OnOff.times(0), player.C.Day = player.C.Day.times(0)
 if (player.C.Year.gte(70)) player.C.Lol = 3, tmp.C.OnOff = tmp.C.OnOff.times(0), player.C.Day = player.C.Day.times(0)

 if (hasUpgrade('N', 12)) player.C.ticks = new Decimal(1)
 if (hasMilestone('N', 3) && player.C.Levelptm >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.Levelftm >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelM >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelE >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelC >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.Levelp >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelG >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelJ >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelB >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.Levelf >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelJB >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.Levelpe >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelR >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelD >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.Levelt >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1)) && player.C.LevelW >= 100 * (player.N.complete.times(player.N.complete).times(3).add(1))) player.N.complete = player.N.complete.add(tmp.N.CG)
 if (!hasMilestone('N', 3) && player.C.Levelptm >= 100 && player.C.Levelftm >= 100 && player.C.LevelM >= 100 && player.C.LevelE >= 100 && player.C.LevelC >= 100 && player.C.Levelp >= 100 && player.C.LevelG >= 100 && player.C.LevelJ >= 100 && player.C.LevelB >= 100 && player.C.Levelf >= 100 && player.C.LevelJB >= 100 && player.C.Levelpe >= 100 && player.C.LevelR >= 100 && player.C.LevelD >= 100 && player.C.Levelt >= 100 && player.C.LevelW >= 100) player.N.complete = new Decimal(1)
 if (player.C.Res >= 1) tmp.C.eptm = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxptm) / 10,  tmp.C.eftm = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxftm) / 10, tmp.C.eM = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxM) / 10, tmp.C.eE = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxE) / 10, tmp.C.eC = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxC) / 10, tmp.C.ep = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxp) / 10, tmp.C.eG = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxG) / 10, tmp.C.eJ = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxJ) / 10, tmp.C.eB = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxB) / 10, tmp.C.ef = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxf) / 10, tmp.C.eJB = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxJB) / 10, tmp.C.epe = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxpe) / 10, tmp.C.eR = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxR) / 10, tmp.C.eD = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxD) / 10, tmp.C.et = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxt) / 10, tmp.C.eW = getBaseLog(1000, player.C.Res) + player.N.total.add(1).add(player.C.maxW) / 10
    },
})

addLayer("N", {

    symbol() { return options.toggleButtonAnimations ? '' : 'N' },
    nodeStyle() {
        return options.toggleButtonAnimations ? {
            'color': '#FF00FF',
            'background-image': 'url("resources/Nitrogen.gif")',
            'background-position': 'center center',
            'background-size': '220%',
            'border': '1px solid #FF00FF'
        } : {
            'background-position': 'center center',
            'background-size': '100%'
        }
    },
    
    image: "https://i.postimg.cc/d3jYWgST/Screenshot-2022-07-23-021248-prev-ui.png",
    name: "Nitrogen", // This is optional, only used in a few places, If absent it just uses the layer id.
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            id: new Decimal(0),
            total: new Decimal(0),
            points: new Decimal(0),
            resets: new Decimal(0),  
            complete: new Decimal(0),
            timer: new Decimal(0),
            days: new Decimal(1),
            ticks: new Decimal(0),
            Xp: new Decimal(2),
            Otext: 'Enter Organic Compound Nomenclature',
            word: '',
            alt: '',
            image: '',
            combo: new Decimal(0),
            HLevel: new Decimal(0),
            failed: new Decimal(0),
            Ntext: 'This is your note pad, you can make it whatever size you want by dragging the thing in the bottom right. You can even copy hints in here *wink* *wink*',
        }
    },

    add1: new Decimal(1),
    Start: new Decimal(0),
    level: new Decimal(1),
    start: new Decimal(0),
    BA: new Decimal(1000),
    PM: new Decimal(1),
    mult: new Decimal(1),
    medal: new Decimal(0),
    div: new Decimal(1),
    swap: new Decimal(0),
    HB: new Decimal(1), 
    CB: new Decimal(1),
    CM: new Decimal(0),
    PMM: new Decimal(0.5),
    Zero: new Decimal(0),
    Five: new Decimal(1),
    CG: new Decimal(1),
    div1: new Decimal(1),
    add: new Decimal(1),
    
    color: '#FF00FF',
    layerShown() {
        if (player.N.resets.gte(1)) return true
        if (player.C.Levelptm >= 100 && player.C.Levelftm >= 100 && player.C.LevelM >= 100 && player.C.LevelE >= 100 && player.C.LevelC >= 100 && player.C.Levelp >= 100 && player.C.LevelG >= 100 && player.C.LevelJ >= 100 && player.C.LevelB >= 100 && player.C.Levelf >= 100 && player.C.LevelJB >= 100 && player.C.Levelpe >= 100 && player.C.LevelR >= 100 && player.C.LevelD >= 100 && player.C.Levelt >= 100 && player.C.LevelW >= 100) return true
        else return false
    },

    onPrestige() {
        if (player.N.timer == 1) tmp.N.medal = new Decimal(1)
        if (player.N.timer == 2) tmp.N.medal = new Decimal(2)
        if (player.N.timer == 3) tmp.N.medal = new Decimal(3)
        player.N.timer = new Decimal(3)
        player.N.resets = player.N.resets.add(1), player.N.complete = new Decimal(0), player.N.ticks = new Decimal(0), player.C.Xpptm = new Decimal(5), player.C.Xpskill = new Decimal(5), tmp.C.eptm = 1, tmp.C.eftm = 1, tmp.C.eM = 1, tmp.C.eE = 1, tmp.C.eC = 1, tmp.C.ep = 1, tmp.C.eG = 1, tmp.C.eJ = 1, tmp.C.eB = 1, tmp.C.ef = 1, tmp.C.eJB = 1, tmp.C.epe = 1, tmp.C.eR = 1, tmp.C.eD = 1, tmp.C.et = 1, tmp.C.eW = 1
        
    },

    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Nitrogen", // Name of prestige currency
    baseResource: "completion(s)", // Name of resource prestige is based on
    baseAmount() { return player.N.complete }, // Get the current amount of baseResource
    requires: new Decimal(1),
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1), // Prestige currency exponent
    gainMult: new Decimal(1), 
    gainExp: new Decimal(1),
    row: 2, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        { key: "n", description: "N: Reset for Nitrogen", onPress() { if (canReset(this.layer)) doReset(this.layer)}, 
        unlocked() { if (hasMilestone('N', 8)) return false
        else return true}},
        {key: "d", description: "D: Reset your life", onPress() { if (player.C.Year >= 30 && hasUpgrade('N', 13)){
            if (player.C.maxptm < player.C.Levelptm) player.C.maxptm = player.C.Levelptm
            if (player.C.maxftm < player.C.Levelftm) player.C.maxftm = player.C.Levelftm
            if (player.C.maxM < player.C.LevelM) player.C.maxM = player.C.LevelM
            if (player.C.maxE < player.C.LevelE) player.C.maxE = player.C.LevelE
            if (player.C.maxC < player.C.LevelC) player.C.maxC = player.C.LevelC
            if (player.C.maxp < player.C.Levelp) player.C.maxp = player.C.Levelp
            if (player.C.maxG < player.C.LevelG) player.C.maxG = player.C.LevelG
            if (player.C.maxJ < player.C.LevelJ) player.C.maxJ = player.C.LevelJ
            if (player.C.maxB < player.C.LevelB) player.C.maxB = player.C.LevelB
            if (player.C.maxf < player.C.Levelf) player.C.maxf = player.C.Levelf
            if (player.C.maxJB < player.C.LevelJB) player.C.maxJB = player.C.LevelJB
            if (player.C.maxpe < player.C.Levelpe) player.C.maxpe = player.C.Levelpe
            if (player.C.maxR < player.C.LevelR) player.C.maxR = player.C.LevelR
            if (player.C.maxD < player.C.LevelD) player.C.maxD = player.C.LevelD
            if (player.C.maxt < player.C.Levelt) player.C.maxt = player.C.Levelt
            if (player.C.maxW < player.C.LevelW) player.C.maxW = player.C.LevelW
    player.C.points= new Decimal(0)
    player.C.fragements= new Decimal(0)
    player.C.Nay= new Decimal(1), 
    player.C.No= new Decimal(1),
    player.C.Yes= new Decimal(0),
    player.C.Lol= 0,
    player.C.Switch= new Decimal(0),
    player.C.Switch1= new Decimal(0),
    player.C.Switch2= new Decimal(1),
    player.C.Year= new Decimal(1),
    player.C.Day= new Decimal(0),
            player.C.Levelptm= 1
            player.C.Xpmaxptm= 100
            player.C.Truemaxptm= 100
            player.C.Xpptm= 5
            player.C.XpToptm= 0
            player.C.Carbonptm= 5
            player.C.Levelftm= 1
            player.C.Xpmaxftm= 100
            player.C.Truemaxftm= 100
            player.C.XpToftm= 0
            player.C.Carbonftm= 9
            player.C.LevelM= 1
            player.C.XpmaxM= 200
            player.C.TruemaxM= 200
            player.C.XpToM= 0
            player.C.CarbonM= 18
            player.C.LevelE= 1
            player.C.XpmaxE= 600
            player.C.TruemaxE= 600
            player.C.XpToE= 0
            player.C.CarbonE= 52
            player.C.LevelC= 1
            player.C.XpmaxC= 800
            player.C.TruemaxC= 800
            player.C.XpToC= 0
            player.C.CarbonC= 200
            player.C.Levelp= 1
            player.C.Xpmaxp= 100
            player.C.Truemaxp= 100
            player.C.XpTop= 0
            player.C.Carbonp= 9
            player.C.LevelG= 1
            player.C.XpmaxG= 1000
            player.C.TruemaxG= 1000
            player.C.XpToG= 0
            player.C.CarbonG= 66
            player.C.LevelJ= 1
            player.C.XpmaxJ= 10000
            player.C.TruemaxJ= 10000
            player.C.XpToJ= 0
            player.C.CarbonJ= 157
            player.C.LevelB= 1
            player.C.XpmaxB= 10000
            player.C.TruemaxB= 10000
            player.C.XpToB= 0
            player.C.CarbonB= 544
            player.C.Levelf= 1
            player.C.Xpmaxf= 100
            player.C.Truemaxf= 100
            player.C.Xpskill= 5
            player.C.XpTof= 0
            player.C.LevelJB= 1
            player.C.XpmaxJB= 100
            player.C.TruemaxJB= 100
            player.C.XpToJB= 0    
            player.C.Levelpe= 1
            player.C.Xpmaxpe= 200
            player.C.Truemaxpe= 200
            player.C.XpTope= 0
            player.C.LevelR= 1
            player.C.XpmaxR= 50
            player.C.TruemaxR= 50
            player.C.XpToR= 0
            player.C.LevelD= 1
            player.C.XpmaxD= 100
            player.C.TruemaxD= 100
            player.C.XpToD= 0
            player.C.Levelt= 1
            player.C.Xpmaxt= 200
            player.C.Truemaxt= 200
            player.C.XpTot= 0
            player.C.LevelW= 1
            player.C.XpmaxW= 100
            player.C.TruemaxW= 100
            player.C.XpToW= 0
            player.C.Mis1= new Decimal(0)
            player.C.Mis2= new Decimal(0)
            player.C.Mis3= new Decimal(0)
            player.C.Mis4 = new Decimal(0)
            player.C.Mis5 = new Decimal(0)
            player.C.ME1 = 0
            player.C.ME2 = 0
            player.C.ME3 = 0
            player.C.ME4 = 0
            player.C.ME5 = 0
            if (player.C.Res != 3  && player.N.resets == 0) player.C.Res = player.C.Res + 1
            if (player.N.resets > 0) player.C.Res = player.C.Res + 1}},
        unlocked() { return true}},
        {key: "enter", description: "Enter: Check answer", onPress() { 
            if (player.N.Otext == player.N.word) run(getRandomWord()), player.N.Otext = '', player.N.combo = player.N.combo.add(1)
            if (player.N.Otext != player.N.word) player.N.combo = player.N.combo.times(0)},
        unlocked() { return true}},
    ],

    tooltip() { return formatWhole(player.N.points) + "  Nitrogen" },
    tooltipLocked() { return formatWhole(player.N.points) + " Nitrogen" },
    
    bars: {
        Battery: {
            tooltip() {
                return `RECHARGE ME.`
            },
            onClick() {
                tmp.N.start = new Decimal(1), setTimeout(Timer, 10000)
            },
            direction: RIGHT,
            width: 150,
            height: 35,
            progress() {
                let progBE = []
              
                progBE =  tmp.N.BA / 1000
                return progBE
            },
            display() { return "Battery" },
            fillStyle() { 
                if (tmp.N.BA.gte(500)) return {"background-color": "#00e600"}
                if (tmp.N.BA.gte(250)) return {"background-color": "#ffa500"}
                if (tmp.N.BA.lt(250)) return {"background-color": "#8b0000"}},
                style() { return {"color": "#301934"}},
                borderStyle(){return {"border-color": "#301934"}},
        },
    },

    milestones: {
        1: {
            tooltip() {
                return "Formula is: log1000(Resets) + 1 + Total Nitrogen + Skill/Job / 10"
            },
            style: { "color": "#301934" },
            requirementDescription: "1 Total Nitrogen",
            effectDescription: "Carbon restart multiplier uses a better formula.",
            done() { return player.N.total.gte(1) },
            onComplete() { player.E.points = player.E.points.add(1) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        2: {
            toggles: [["C", "auto1"]],
            style: { "color": "#301934" },
            requirementDescription: "2 Total Nitrogen",
            effectDescription: "Automate 1 Skill per reset. Two resets and onward.",
            done() { return player.N.total.gte(2) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        3: {
            style: { "color": "#301934" },
            requirementDescription: "5 Total Nitrogen",
            effectDescription: "You can get more than 1 completion. However, completions boost shop costs and Xp Left gain.",
            done() { return player.N.total.gte(5) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        4: {
            style: { "color": "#301934" },
            requirementDescription: "10 Nitrogen Resets",
            effectDescription: "Automate Jobs.",
            done() { return player.N.resets.gte(10)},
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        5: {
            toggles: [["C", "auto"]],
            style: { "color": "#301934" },
            requirementDescription: `Have Upgrade "Thermal Decomposition"`,
            effectDescription: "Toggle AutoShop.",
            done() { return hasUpgrade('N', 15)},
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        6: {
            style: { "color": "#301934" },
            requirementDescription: "Reset Nitrogen In Under 10 Minutes",
            effectDescription: "Bronze Medal/Under 12,000 ticks",
            done() { return tmp.N.medal.gte(1) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        7: {
            style: { "color": "#301934" },
            requirementDescription: "Reset Nitrogen In Under 1 Minute",
            effectDescription: "Silver Medal/Under 1200 ticks",
            done() { return tmp.N.medal.gte(2) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        8: {
            style: { "color": "#301934" },
            requirementDescription: "Reset Nitrogen In Under 5 Seconds",
            effectDescription: "Gold Trophy/Under 100 ticks. Lose all your Nitrogen xD.",
            done() { return tmp.N.medal.gte(3)},
            onComplete() { player.N.points = new Decimal(0) },
            unlocked(){
                if (hasMilestone('N', 8)) return false
            },
        },
        9: {
            style: { "color": "#301934" },
            requirementDescription: "Have a combo of 3",
            effectDescription: "Add 1 to the base that is multiplied by the combo.",
            done() { return player.N.combo.gte(3)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        10: {
            style: { "color": "#301934" },
            requirementDescription: "Have a combo of 5",
            effectDescription: "Add 1 to the base that is multiplied by the combo.",
            done() { return player.N.combo.gte(5)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        11: {
            style: { "color": "#301934" },
            requirementDescription: "Have a combo of 10",
            effectDescription: "Multiply the combo by two.",
            done() { return player.N.combo.gte(10)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        12: {
            style: { "color": "#301934" },
            requirementDescription: "Have a combo of 50",
            effectDescription: "Nitrogen multiplies Nitrogen.",
            done() { return player.N.combo.gte(50)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        13: {
            style: { "color": "#301934" },
            requirementDescription: "Have 10 Nitrogen",
            effectDescription: "Keep 50% of combo on failure.",
            done() { return player.N.points.gte(10) && hasMilestone('N', 8)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        14: {
            style: { "color": "#301934" },
            requirementDescription: "Have 100 Nitrogen",
            effectDescription: "Keep 100% of combo on failure.",
            done() { return player.N.points.gte(100) && hasMilestone('N', 8)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        15: {
            style: { "color": "#301934" },
            requirementDescription: "Have 200 Nitrogen",
            effectDescription: "Lower Nitrogen amount lost on failure.",
            done() { return player.N.points.gte(200) && hasMilestone('N', 8)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
        16: {
            style: { "color": "#301934" },
            requirementDescription: "Have 500 Nitrogen",
            effectDescription: "Lose 0 Nitrogen on failure.",
            done() { return player.N.points.gte(500) && hasMilestone('N', 8)},
            unlocked(){
                if (hasMilestone('N', 8)) return true
            },
        },
    },

    clickables: {
        11: {
            style: {color: "#301934", 'border-radius': '0%', 'min-height': '50px', width: '80px', position: 'relative', top: '-245px', right: '-255px'},
            title() {
                if (tmp.N.swap == 0 && player.N.total > 0 && !hasUpgrade('N', 14)) return "Health"
                if (tmp.N.swap == 1 && player.N.total > 0 && !hasUpgrade('N', 14)) return "Carbon"
                else return "Nothing"},
            tooltip() {
                if (tmp.N.swap == 0 && player.N.total > 0 && !hasUpgrade('N', 14)) return "Boosting Health"
                if (tmp.N.swap == 1 && player.N.total > 0 && !hasUpgrade('N', 14)) return "Boosting Carbon/day"
                else return "Boosting Nothing"
            },
            effect() {
                if (tmp.N.swap == 0 && player.N.total > 0) tmp.N.HB = player.N.total * 2
                else tmp.N.HB = new Decimal(1)
                if (tmp.N.swap == 1 && player.N.total > 0) tmp.N.CB = player.N.total * 3
                else tmp.N.CB = new Decimal(1)
                if (hasUpgrade('N', 14)) tmp.N.HB = player.N.total * 2, tmp.N.CB = player.N.total * 3
            },
            canClick() { return true},
            onClick() {
             if (tmp.N.swap == 0) tmp.N.swap = 1
             else tmp.N.swap = 0
            },
        },
    },
    infoboxes: {
        lore: {
            titleStyle: { "color": "#301934" },
            title: "Nitrogen",
            body() { return "This one is big, you can't push me over again like last time man. You gotta name like these organic compounds correctly or you won't get any Nitrogen. The more ya get right, the better this will go. So you better guess right." },
        },
        lore1: {
            titleStyle: { "color": "#301934" },
            title: "Nitrogen",
            body() { return "This one is fucking big, so you can't push me over again just like last time man. You gotta name like these organic compounds correctly or you won't get any Nitrogen. The more ya get right, the better this will go. So you better guess right or shit will hit the fan for us real quick." },
        },
    },

    upgrades: {
        11: {
            style: { "color": "#301934" },
            title: "Screw You Again",
            description: "Keep screw you. Keep cost.",
            cost() { return new Decimal(1)},
            onPurchase() {return player.N.points = player.N.points.add(1)}
        },
        12: {
            style: { "color": "#301934" },
            title: "Rapid Decompression",
            description: "Days happen every tick now.",
            cost() { return new Decimal(2)},
            onPurchase() {return player.N.Xp = player.N.Xp.times(5)}
            
        },
        13: {
            style: { "color": "#301934" },
            title: "Organic Matter",
            description: `Live until 70 years. You can "reset" yourself when you choose to do so (past 30 years, hotkey is D).`,
            cost() { return new Decimal(3)},
            
        },
        14: {
            style: { "color": "#301934" },
            title: "Borazine, The Inorganic Benzene.",
            description: "Days happen twice as fast and your Nitrogen boosts your Health and Carbon/day.",
            cost() { return new Decimal(5)},
            onPurchase() {return player.N.days = player.N.days.add(1), player.N.Xp = player.N.Xp.times(2)}
        },
        15: {
            style: { "color": "#301934" },
            title: "Thermal Decomposition",
            description: "Shop items costs are divided by 2. Unlock AutoShop (toggle in milestones)",
            cost() { return new Decimal(8)},
        },
        16: {
            style: { "color": "#301934" },
            title: "Inert Gas Asphyxiation: Capital Punishment Edition.",
            description: "Double completion gain. Also, you start playing after Nitrogen reset.",
            cost() { return new Decimal(13)},
        },
   },

   clickables: {
   11: {
    style: {color: "#301934", 'border-radius': '0%', 'min-height': '10px', width: '100px'},
    title: "Submit",
    tooltip() {
        return 'Submit Your Answer.'
    },
    canClick() { return true},
    onClick() {
    getRandomWord()
    },
  },
},

    tabFormat: {
        "MainTab": {
            content: [
                ['upgrade', 11],
                ['row', [
                ['upgrade', 12],
                ['upgrade', 13],
                ['upgrade', 14],
                ]],
                ['upgrade', 15],
                ['upgrade', 16],
                ['display-text', 
                function() { if (player.p.Node < 1) return 'You have made a total of ' + formatWhole(player.N.total) + ' Nitrogen and have done ' + formatWhole(player.N.resets) + ' Nitrogen resets.'}],
                () => (!hasMilestone('N', 8)) ?'milestones': '',
                () => (options.matureMode == false) ? ['infobox', 'lore'] : ['infobox', 'lore1'],
                "blank",
                "main-display",
                ['display-text',
                function() {
                    if (player.p.Node < 1 && tmp.N.swap == 0 && !hasUpgrade('N', 14)) return 'Your Total Nitrogen is multiplying your Health by ' + formatWhole(tmp.N.HB)
                    if (player.p.Node < 1 && tmp.N.swap == 1 && !hasUpgrade('N', 14)) return 'Your Total Nitrogen is multiplying Carbon/day by ' + formatWhole(tmp.N.CB)
                    if (player.p.Node < 1 && hasUpgrade('N', 14)) return 'Your Total Nitrogen is multiplying Carbon/day by ' + formatWhole(tmp.N.CB) + ' and your Health by ' + formatWhole(tmp.N.HB)
                    }],
                        "blank",
                        () => (!hasMilestone('N', 8)) ? 'prestige-button': '',
                    "blank",
                    ['display-text', 
                    function() { if (player.p.Node < 1) return '<h2>You are ' + formatWhole(player.N.ticks) + ' ticks into the run.</h2>'}],
                    "blank",
                ['display-text',
                function() { if (player.p.Node < 1) return 'You have ' + formatWhole(player.N.complete) + ' completion'}],
                () => (hasUpgrade('N', 14)) ? '' : ['clickables', 11],
             ["row", function () {
                    if (hasMilestone('N', 6)) return [ 
                        ["display-image", 'https://i.postimg.cc/xd40rQgB/bronze-medal-paper-craft.png', { 'height': `400px`, 'width': `300px`, position: 'relative', right: '-250px'}],
                ]}],
                ["row", function () {
                    if (hasMilestone('N', 7)) return [ 
                        ["display-image", 'https://i.postimg.cc/MTfzqLFH/silver-medal-paper-craft.png', { 'height': `400px`, 'width': `300px`, position: 'relative', top: '-400px', right: '250px'}],
                ]}],
                ["row", function () {
                    if (hasMilestone('N', 8)) return [ 
                        ["display-image", 'https://i.postimg.cc/0jgPQCTf/purepng-com-gold-cup-trophygolden-cupgoldtrophymedal-1421526534837pvf6x.png', { 'height': `400px`, 'width': `300px`, position: 'relative', top: '-800px', 'z-index': '100'}],
                ]}],
                ['display-text', 
                function(){'', tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), tmp.N.level = new Decimal(1), clearTimeout(tmp.N.Start)}],
            ]            
        },
        "Organic": {
            content: [
                ['clickable', 11],
                ["strict-text-input1", "Otext"],
                ['strict-text-box', "Ntext"],
                ['display-text', 
                function() { if (player.p.Node == 1) return 'What is this organic chemical compound? Put the answer in the Helium Inputbox.'}],
                ["display-image",
                function() { if (player.p.Node == 1) return 'https://i.postimg.cc/yxQBnL35/Racemic-methamphetamine-svg.png'}],
                ["display-image1", function(){
                    return player.N.image}],
                    "blank",
                ['display-text', 
                function() { if (player.p.Node < 1) return '<h1>Current Combo: x' + format(player.N.combo) + '. Current Nitrogen: ' + format(player.N.points) + '. Failed: ' + formatWhole(player.N.failed) + '</h1>'}],
                ['display-text', 
                function(){'', tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), tmp.N.level = new Decimal(1), clearTimeout(tmp.N.Start)}],
            ],  
            unlocked() {
                if (hasMilestone('N', 8)) return true
            }
        },
        "Milestones": {
            content: [
                'milestones',
                ['display-text', 
                function(){'', tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), tmp.N.level = new Decimal(1), clearTimeout(tmp.N.Start)}],
            ],  
            unlocked() {
                if (hasMilestone('N', 8)) return true
            }
        },
        "Help": {
            content: [
                ['display-text', 
                function() { return '1. Identify and count the longest chain of carbon atoms. In this case it is 7. NOT CASE SENSITIVE.'}],
                "blank",
                ["display-image", 'https://i.postimg.cc/250pzSmv/Screenshot-2022-07-29-204808-removebg-preview-removebg-preview.png'],
                "blank",
                ['display-text', 
                function() { return '2. Name the longest carbon chain. Since the number of carbon atoms in our chain is 7, our corresponding root is hept.'}],
                "blank",
                ["display-image", 'https://i.postimg.cc/MK7pt1L3/Screenshot-2022-07-29-210244.jpg', { 'height': `400px`, 'width': `300px`}],
                "blank",
                ['display-text', 
                function() { return '3. Find the suffix based on the functional group (a specific group of molecules you can easily spot in a compound). In this chemical compound the functional group alkyl/alkane is present. We take the suffix of that (-ane) and add it to hept giving us heptane. If it was -ol, it would be heptanol. If it was -al, it would be heptanal. The first chart is in order from what should be listed first to last. The second chart is for further aid on what suffix to use based on the functional group.'}],
                "blank",
                ["display-image", 'https://i.postimg.cc/5yWWcYqm/8de018dfc766430399fbcebc6a9ea556.jpg', { 'height': `600px`, 'width': `500px`}],
                ["display-image", 'https://i.postimg.cc/NFhr2ByK/Screenshot-2022-07-29-210949.jpg', { 'height': `400px`, 'width': `300px`}],
                "blank",
                ['display-text', 
                function() {  return '4. Number the longest carbon atom chain by which side aproaches the side group(s) the first. In this case both sides reach the side group on 4. Keep 4- in mind.'}],
                "blank",
                ["display-image", 'https://i.postimg.cc/sXLthHMg/naming-compounds-step5-removebg-preview.png'],
                "blank",
                ['display-text', 
                function() { return '5. Name the side group(s). In this side group, we have a bromine atom bonded to a carbon atom. Check the chart below for the prefixes or suffixes. If there is two identical side groups then put the prefix -di, -tri, ect. Since -bromo comes before -methyl on the chart, we get 4-bromomethyl. Overall, our organic chemical compound is 4-(Bromomethyl)heptane, the side group coming before the main group and in brackets to avoid a space such as 4-Bromomethyl heptane. There can also not be a side group. If there are more than one side groups, then order them based on how high they are on the chart. For example if we add a Cl to the first carbon atom, our organic chemical compound is now 4-(Bromomethyl)-1-chloro-heptane. Seperate it with a "-". If the Cl is replaced with another CH bonded to a Br then the organic chemical compound becomes 1,4-(Dibromomethyl)heptane. The Br bonded to a CH are both present and on the first and fourth carbon atom in the chain. You order the numbers from least to greatest and since there is two, add Di to the bromomethyl. For the benzene ring, if it is part of the main group add the prefix phenyl. For example, if we had a bezene ring bonded to a OH, the functional group is an alcohol so phenyl becomes phenol. If we add a Cl one edge away from the OH then the organic chemical compound becomes 2-chlorophenol as we count from the origin of the functional group being OH.'}],
                "blank",
                    ["display-image", 'https://i.postimg.cc/sgcWS25x/Screenshot-2022-07-29-215108.jpg'],
                    "blank",
                    ['display-text', 
                    function() { return '6. There is another form of displaying the structure. In the diagram below, the edges/ends of the lines are assumed to be carbon atoms. A bezene ring is the hexagon with three lines in it. Here the organic chemical compound is butyl phenyl ether. If all else fails use the hints.'}],
                    "blank",
                    ["display-image", 'https://i.postimg.cc/J7Dhd9cK/mfcd00009438-large-removebg-preview-removebg-preview-2.png'],
                    ['display-text', 
                    function(){ '', tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), tmp.N.level = new Decimal(1), clearTimeout(tmp.N.Start)}],
            ],
            unlocked() {
                if (hasMilestone('N', 8)) return true
            }
        },
        "Minigame": {
            content: [
                ['display-text', 
                function() { if (player.p.Node < 1) return "Hover over the lightning bolts before the battery dies to restore the battery's life. Click on the battery to start. (May not work on mobile, I dunno)"}],
                "blank",
                ['display-text', 
                function() { if (player.p.Node < 1) return "<h3>Level: " + formatWhole(tmp.N.level) + ". Highest Level: " + formatWhole(player.N.HLevel) + "</h3"}],
                "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank",
                ['bar', 'Battery'],
                ['display-text', 
                function(){if (tmp.N.start == 1) return '',  makeShinies(PartL), format(tmp.N.BA = tmp.N.BA.sub(tmp.N.level.div(5).add(1)))}],
            ],  
            unlocked() {
                if (hasMilestone('N', 8)) return true
            }
        },
    },

    componentStyles:{
        'prestige-button'() {
             if (tmp['N'].canReset == false)return {color: "#301934"}
             if (tmp['N'].canReset == true)return {color: "#DDA0DD", 'background-color': '#301934'}}
    },

    const: PartN = {
        image() {   
           return ''},
        text() {
            return 'Nitrogen +' + format(tmp.N.add)
        },
        
        style: { "background-size": "100% 100%", color: '#DDA0DD', 'text-shadow': '0 0 40px #fff'},
        gravity: 0.1,
        time: 2,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8  
        },
    },

    const: PartNN = {
        image() {   
           return ''},
        text() {
         return 'Nitrogen -' + format(player.N.points.times(tmp.N.PMM))
        },
        
        style: { "background-size": "100% 100%", color: '#ffa07a', 'text-shadow': '0 0 40px #fff'},
        gravity: 1,
        time: 2,
        speed() { // Randomize speed a bit
            return (Math.random() + 1.2) * 8  
        },
    },

    const: PartL = {
        image() {   
           return 'https://i.postimg.cc/SQTdJZVM/lightning-bolt-transparent-background-lightning-transparent-11562918534vgs0gehr9q.png'},
           onClick(){
            
         },
        onMouseOver(){
            if (tmp.N.BA.lt(1000)) tmp.N.BA = tmp.N.BA.add(10)
         },
    
        style: { "background-size": "100% 100%", color: '#ffa07a', 'text-shadow': '0 0 40px #fff'},
        gravity: 0,
        time: 1,
        speed() { // Randomize speed a bit
            return 0 
        },
    },
    

    update(){ 
        if(tmp.N.level.gt(player.N.HLevel)) player.N.HLevel = tmp.N.level
        if(tmp.N.BA.lt(0)) tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), clearTimeout(tmp.N.Start), tmp.N.level = new Decimal(1)
        if(player.tab != this.layer) tmp.N.start = new Decimal(0), tmp.N.BA = new Decimal(1000), tmp.N.level = new Decimal(1)
        if(hasMilestone('N', 9)) tmp.N.add1 = new Decimal(2)
        if(hasMilestone('N', 10)) tmp.N.add1 = new Decimal(3)
        if(hasMilestone('N', 11)) tmp.N.mult = new Decimal(2)
        if(hasMilestone('N', 12)) tmp.N.PM = getBaseLog(1000, player.N.points)
        if(hasMilestone('N', 13)) tmp.N.CM = new Decimal(0.5)
        if(hasMilestone('N', 14)) tmp.N.CM = new Decimal(1)
        if(hasMilestone('N', 15)) tmp.N.PMM = new Decimal(0.1)
        if(hasMilestone('N', 16)) tmp.N.PMM = new Decimal(0)
        if (player.N.points.lt(0)) player.N.points = new Decimal(0)
        tmp.N.add = tmp.N.add1.times(player.N.combo).times(tmp.N.PM).add(1)
        if (player.N.word == '') run(getRandomWordfi())
        if (player.N.resets.gte(1)) player.N.ticks = player.N.ticks.add(1)
        if (player.N.ticks.gte(103)) player.N.timer = new Decimal(2)
        if (player.N.ticks.gte(1200) && player.N.ticks.lte(1210)) player.N.timer = new Decimal(1)
        if (player.N.ticks.gte(12000) && player.N.ticks.lte(12010)) player.N.timer = new Decimal(0)
        if (hasUpgrade('N', 11)) player.C.No = 1
        if (hasUpgrade('N', 15)) tmp.N.div = 2
        if (needCanvasUpdate = true && player.tab == 'N')  options.forceOneTab = true,  options.theme = themes[2], changeTheme()
        if(hasUpgrade('N', 12)) tmp.N.Zero = 4
        if(hasUpgrade('N', 12)) tmp.N.Five = 5
        if(hasUpgrade('N', 16)) tmp.N.CG = 2
        if(hasMilestone('N', 4)) player.C.Switch = new Decimal(1), tmp.N.div1 = new Decimal(9)
        if (hasUpgrade('N', 15) && player.C.auto && tmp.C.Income > ((200 * player.N.days * ((player.N.complete * 20.5) + 1) * tmp.N.Five * temp['C'].bars['Persuasion'].effect) / tmp.N.div) + ((player.C.ME1 + 2 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div) + ((player.C.ME2 + 10 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div) + ((player.C.ME3 + 30 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div) + ((player.C.ME4 + 150 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div) + ((player.C.ME5 + 400 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div)) player.C.Switch2 = 5, player.C.Mis1 = 1, player.C.Mis2 = 1, player.C.Mis3 = 1, player.C.Mis4 = 1, player.C.Mis5 = 1, player.C.ME5 = (player.C.ME5 + 400 * player.N.days * tmp.N.Five * temp['C'].bars['Persuasion'].effect) * ((player.N.complete * 20.5) + 1) / tmp.N.div, player.C.ME4 = (player.C.ME4 + 150 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div, player.C.ME3 = (player.C.ME3 + 30 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div, player.C.ME2 = (player.C.ME2 + 10 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div, player.C.ME1 = (player.C.ME1 + 2 * tmp.N.Five * player.N.days * temp['C'].bars['Persuasion'].effect)  * ((player.N.complete * 20.5) + 1) / tmp.N.div
        if (hasUpgrade('N', 16) && player.N.ticks < 10) tmp.C.OnOff = new Decimal(1) 
    }
})