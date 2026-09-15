clickables: {
        91: {
            title: "Custom",
            canClick() {return true},
            onClick() {return addPoints(prompt("Layer?"),prompt("alue?"))}
        },
        11: {
            title: "+1000 dressy points",
            canClick() {return true},
            onClick() {return addPoints('D',1e3)}
        },
        12: {
            title: "Double dressy points",
            canClick() {return true},
            onClick() {return addPoints('D',player.D.points)}
        },
        13: {
            title: "Reset dressy points",
            canClick() {return true},
            onClick() {return addPoints('D',player.D.points.sub(player.D.points.times(2)))}
        },
        14: {
            title: "25+ super",
            canClick() {return true},
            onClick() {return addPoints('S',25)}
        },
        15: {
            title: "Double super",
            canClick() {return true},
            onClick() {return addPoints('S',player.S.points)}
        },
        16: {
            title: "Reset super",
            canClick() {return true},
            onClick() {return addPoints('S',player.S.points.sub(player.S.points.times(2)))}
        },
        21: {
            title: "150+ hyper",
            canClick() {return true},
            onClick() {return addPoints('H',150)}
        },
        22: {
            title: "Double hyper",
            canClick() {return true},
            onClick() {return addPoints('H',player.H.points)}
        },
        23: {
            title: "Reset hyper",
            canClick() {return true},
            onClick() {return addPoints('H',player.H.points.sub(player.H.points.times(2)))}
        },
        24: {
            title: "1+ money",
            canClick() {return true},
            onClick() {return addPoints('M',1)}
        },
        25: {
            title: "Double money",
            canClick() {return true},
            onClick() {return addPoints('M',player.M.points)}
        },
        26: {
            title: "Reset money",
            canClick() {return true},
            onClick() {return addPoints('M',player.M.points.sub(player.M.points.times(2)))}
        },
        31: {
            title: "1+ MA",
            canClick() {return true},
            onClick() {return addPoints('Ma',1)}
        },
        32: {
            title: "Double MA",
            canClick() {return true},
            onClick() {return addPoints('Ma',player.Ma.points)}
        },
        33: {
            title: "Reset MA",
            canClick() {return true},
            onClick() {return addPoints('Ma',player.Ma.points.sub(player.Ma.points.times(2)))}
        },
        34: {
            title: "1+ Mi",
            canClick() {return true},
            onClick() {return addPoints('Mi',1)}
        },
        35: {
            title: "Double Mi",
            canClick() {return true},
            onClick() {return addPoints('Mi',player.Mi.points)}
        },
        36: {
            title: "Reset Mi",
            canClick() {return true},
            onClick() {return addPoints('Mi',player.Mi.points.sub(player.Mi.points.times(2)))}
        },      
    },