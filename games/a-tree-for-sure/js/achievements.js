addLayer(`a`, {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        sea : new Decimal(0),
        seam : new Decimal(0),
        clicon : 0,
    }},

    color: `#FFFF00`,                       // The color for this layer, which affects many elements.
    row: `side`,                                 // The row this layer is on (0 is the first row).

    layerShown() { return true },          // Returns a bool for if this layer's node should be visible in the tree.

    tooltip() { // Optional, tooltip displays when the layer is locked
        return (`Achievements`)
    },
    tabFormat:[
        [`display-text`,
            function() { return `You found ${player.a.achievements.length} Achievements <br>
             boosting your self esteem by `+format(eff)},
            {"font-size": `32px`}],
        [`display-text`,
            function(){if(player.a.clickables[11]==1) return `You found ${player.a.sea}/${player.a.seam} Secret Achievements <br>`}],
        `blank`,
        `blank`,
        `clickables`,
        [`display-text`,
            function() {if(player.a.clicon==1) return `You chose the easy path, look for oddities and there shall be your prizes`},
            {"font-size": `32px`}],
        [`display-text`,
            function() {if(player.a.clicon!=1 && player.a.clickables[21]!=1) return `Hard mode needs you to have never used any other achievement clickable`},
            {"font-size": `32px`}],
        `blank`,`blank`,
        `achievements`,
        [`display-text`,
            function(){return `Pressing shift while hovering above an achievement will display it's goal tooltip (if you completed the achievement)`}],
    ],

    clicon : 0,

    effect() {
        eff = new Decimal(player.a.achievements.length)
        eff = eff.pow(eff.pow(player.a.sea.add(1)))
        return eff
        },

    clickables: {
        11: {
            title: `Show how many secrets are currently achievable?`,
            display() {
                if(player.a.clickables[11]==1){return `Yes`}
                return `No`},
            canClick(){return true},
            onClick(){
                if(player.a.clickables[11]==1)player.a.clickables[11]=0
                else player.a.clickables[11]=1
                if(player.a.clicon==0) player.a.clicon=1},
            unlocked(){if(player.a.clickables[21]==1) return false
            else return true},
            style() {const style = {}; if (player.a.clickables[11]==1) style[`background-color`] = `#00FF00`
            else style[`background-color`] = `#FF0000`
            return style}

    },
    12: {
        title: `Enable help for the secrets and other parts of the game?`,
        display() {
            if(player.a.clickables[12]==1){return `Yes`}
            return `No`},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[12]==1)player.a.clickables[12]=0
            else player.a.clickables[12]=1
            if(player.a.clicon==0) player.a.clicon=1},
        unlocked(){if(player.a.clickables[21]==1) return false
        else return true},
        style() {const style = {}; if (player.a.clickables[12]==1) style[`background-color`] = `#00FF00`
        else style[`background-color`] = `#FF0000`
        return style}
},
    21: {
        title: `Play Hard mode: disable the two upmost clickables, no help <i>ever</i> for you`,
        display() {
            if(player.a.clickables[21]==1){return `Yes`}
            return `No`},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[21]==1)player.a.clickables[21]=0
            else player.a.clickables[21]=1},
        unlocked(){if(player.a.clicon==1 || player.a.clickables[21]==1 || player.a.clickables[11]==1 || player.a.clickables[12]==1) return false
        return true},
        style() {const style = {}; if (player.a.clickables[21]==0) style[`background-color`] = `#FF0000`; return style},

},
    22: {
        title: `Play Hardest mode, and win against all odds`,
        display() {
            if(player.a.clickables[22]==1){return `Yes`}
            return `No`},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[22]==1)player.a.clickables[22]=0
            else player.a.clickables[22]=1
            player.points = player.points.times(0)
            player.c.points = player.c.points.times(0)},
        unlocked(){if (hasUpgrade('c', 11) || hasAchievement('a', 11) || player.a.clickables[22]==1) return false
                return true},
                style() {const style = {};style[`background-color`] = `#FF0000`; return style},

    },


},
    
    achievements: {
        11: {
            name: `First win!`,
            done() {
				return (hasUpgrade('c', 12))
			},
            goalTooltip() {return`Get the second upgrade`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : A fleeting feeling of accomplishment`},

        },
        12:{
            name: `Content`,
            done() {
				return (player.m.points.gte(1))
			},
            goalTooltip() {return`Get the second layer`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : The second layer`},
        },
        13: {
            name: `That's... not helping`,
            done() {
				return (hasUpgrade('c', 22))
			},
            goalTooltip() {return`Get the the seventh clue upgrade`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : A fleeting feeling of despair and a mystery challenge`},

        },
        14: {
            name: `Take a hint`,
            done() {
				return (player.c.points.gte(1e10))
			},
            goalTooltip() {return`Get 1e10 clues`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : Cookie time is no longer required to continue purchasing clue upgrades`},

        },
        15:{
            name: `That's... no, not this one`,
            done() {return (hasUpgrade('c', 25))},

            goalTooltip() {return`While in second mystery challenge buy the upgrade that unlocks it`},
            onComplete(){player.a.seam = player.a.seam.add(1)},
            doneTooltip() {if (player.shiftin) return
                return`Reward : Why would you get rewarded for that?`},
        },
        16: {
            name: `You have been bamboozled`,
            done() {
				return (hasUpgrade('c', 26))
			},
            goalTooltip() {return`Get a new layer`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : not a new layer but more of those pesky challenges`},

        },
        19: {
            name: `Wow so secret`,
            done() {return (hasUpgrade('c', 23))},
            goalTooltip() {return`This doesn't seem right`},

            doneTooltip() {return`Reward : A way to boost passive clue gain later on (but don't forget to buy it back after resets)`},
            unlocked() {return (hasAchievement('a', 19))},
            onComplete(){player.a.sea = player.a.sea.add(1)},
            
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}
        },
        21: {
            name: `You win some you lose some`,
            done() {
				return(hasChallenge(`m`, 14))
			},
            goalTooltip() {return`Finish mystery challenge 4`},

            doneTooltip() {if (player.shiftin) return
                return`Guess that's nerfed enough`},

        },
        22: {
            name: `That was a mistake`,
            done() {
				if(hasChallenge(`m`, 14)) return (hasUpgrade('c', 22))
			},
            goalTooltip() {return`Get stuck in Cookie Time`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : A new layer but only to get out of Cookie Time`},

        },
        23: {
            name: `That mistake seems useful`,
            done() {
				return (hasChallenge('d', 11))
			},
            goalTooltip() {return`Finish the Despair Challenge`},
            onComplete(){player.a.seam = player.a.seam.add(1)},
            doneTooltip() {if (player.shiftin) return
                return`Reward : The promised new layer is finally unlocked`},

        },

        24: {
            name: `But hey, that's just a `,
            done() {
				return (player.t.points.gte(1))
			},
            goalTooltip() {return`Get your first theory`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : Erm, this achievement I guess?`},

        },

        25: {
            name: `Wow new layers?`,
            done() {
				return (hasUpgrade('t', 21))
			},
            goalTooltip() {return`Buy fourth Theory upgrade`},
            onComplete(){player.a.seam = player.a.seam.add(1)},
            doneTooltip() {if (player.shiftin) return
                return`Funny story, you can't reset them... Would a theory challenge cheer you up?`},

        }, 

        26: {
            name: `You chose... correctly`,
            done() {
				return (!hasAchievement(`a`, 27) && (player.fo.unlocked))
			},
            goalTooltip() {return`Do a third layer reset`},

            doneTooltip() {if (player.shiftin) return
                return`Choose the superior new layer, forums. You have pledged your loyalty to them, removing your ability to use the other`},
            unlocked() {return (!hasAchievement('a', 27))},

        },

        27: {
            name: `You chose... correctly`,
            done() {
				return (!hasAchievement(`a`, 26) && (player.fr.unlocked))
			},
            goalTooltip() {return`Do a third layer reset`},

            doneTooltip() {if (player.shiftin) return
                return`Choose the superior new layer, friends. You have pledged your loyalty to them, removing your ability to use the other`},
            unlocked() {return (hasAchievement('a', 27))},

        },

        29: {
            name: `Secrets all around`,
            done() {
				return (hasUpgrade('d', 44))
			},
            goalTooltip() {return`Why so desperate?`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : something, surely, sometime`},
            unlocked() {return (hasAchievement('a', 29))},
            onComplete(){player.a.sea = player.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}

        },

        31: {
            name() {
				if (hasAchievement('a', 31)) return`Felt fishy anyways`
                return `find your friends again they love you and you love them so much`
			},
            done() {
				return (hasAchievement(`a`, 26) && (player.fr.unlocked))
			},
            goalTooltip() {
				if (hasAchievement('a', 31)) return`Unlock the Friend layer again`
                return `find your friends again they love you and you love them so much`
			},

            doneTooltip() {if (player.shiftin) return
                return`You will pay for abandoning them. For a long time.`},
            unlocked() {return (hasAchievement('a', 26))},

        },

        32: {
            name: `Back to dating 'e-girls'`,
            done() {
				return (hasAchievement(`a`, 27) && (player.fo.unlocked))
			},
            goalTooltip() {return`Get your internet up and running again`},

            doneTooltip() {if (player.shiftin) return
                return`You got an old new layer back, yet you still desire more? Despicable`},
            unlocked() {return (hasAchievement('a', 27))},
        },
        33: {
            name: `A world of [friends]`,
            done() {
				return (player.fr.points.gte(8e9))
			},
            goalTooltip() {return`Get everybody in the whole wide world to be your buddy`},

            doneTooltip() {if (player.shiftin) return
                return`There is no more friends to be found<br>Reward : Orlan`},
        },
        34: {
            name() {
				if (hasAchievement('a', 34)) return`You have been bamboozled again`
                return `New layered`
			},
            done() {
				return (hasUpgrade(`t`, 41))
			},
            goalTooltip() {
				if (hasAchievement('a', 34)) return`Unlock a Theory layer of upgrade`
                return `The title says it all, no?`
			},

            doneTooltip() {if (player.shiftin) return
                return`I swear it works every time (but maybe because you have no other choices)`},

        },
        35: {
            name: `Choosing is for nerds`,
            done() {return((hasMilestone('fo', 5) && hasAchievement('a', 32)) || (hasUpgrade('fr', 26) && hasAchievement('a', 31)))},
            goalTooltip() {return`Unlock the layer that you have already have unlocked eons ago<br><i>That's so dumb omg</i>`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : The layer that let you unlock the already unlocked layer now decides that it want to act as if it was chosen first or something`},
        },
        36: {
            name: `Challenge conqueror`,
            done() {return (challengeCompletions('t', 12)==5)},
            goalTooltip() {return`See that theory challenge? Well beat it five times`},

            doneTooltip() {if (player.shiftin) return
                return`Reward : A new Forum upgrade <br><i> Woaw, an actual reward? How rare</i>`},
        },
        37: {
            name: `Like oil and water`,
            done() {return(hasUpgrade('t', 45))},
            goalTooltip() {return`Set your standards to the floor`},
            onComplete(){player.a.seam = player.a.seam.add(1)},
            doneTooltip() {if (player.shiftin) return
                return`Reward : My pity <br><i>Are you really that desperate?</i>`},
        },
        38: {
            name: `That's not even a secret`,
            done() {return (hasUpgrade(`t`, 52) && !(player.g.unlocked))},
            goalTooltip() {return`Get a positive effect from Cookie before unlocking Global Conspiracies`},
            unlocked() {return (hasAchievement('a', 38))},
            doneTooltip() {if (player.shiftin) return
                return`I genuinely do not believe you reached in here without cheating. If you did, in fact, not cheat, please contact me, this is not supposed to happen`},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}
        },
        39: {
            name: `Why would you even bother?`,
            done() {
				if (inChallenge('t', 11) && !inChallenge('t', 13))return (hasUpgrade('c', 31))
			},
            goalTooltip() {return`Try to buy something way too expensive in theory challenge`},

            doneTooltip() {if (player.shiftin) return
                return`That was a pain guess I'll make part of <b>No. No it's not.</>'s base take effect even when not bought yet. You deserve it`},
            unlocked() {return (hasAchievement('a', 39))},
            onComplete(){player.a.sea = player.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}

        },

        41: {
            name: `Master Fidgetor`,
            done() {return (tmp.t.baf>30)},
            goalTooltip() {return`Fidget with the mutually repulsive theory upgrades`},
            unlocked() {return (hasAchievement('a', 41))},
            doneTooltip() {if (player.shiftin) return
                return`Can't blame you, it felt good playing with it <br><br> You get to keep both upgrades I guess then, but only the stronger effect will apply`},
            onComplete(){player.a.sea = player.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}
        },

        42: {
            name: `Where did my upgrade go?`,
            done() {return (tmp.g.upach)},
            goalTooltip() {return`Lose one of your weird upgrades?`},
            unlocked() {return (hasAchievement('a', this.id))},
            doneTooltip() {if (player.shiftin) return
                return`You just had to find what that did, didn't you? Well it had consequences too bad`},
            onComplete(){player.a.sea = player.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style[`background-color`] = `#A75FBF`; return style}
        },

        51: {
            name: `The Upgrade Nurse`,
            done() {return (tmp.c.repare.gte(100))},
            goalTooltip() {if(player.a.clickables[12]==1)return`Repare a lost upgrade`
                return `If you have Kylian, you can figure it out`},
            doneTooltip() {if (player.shiftin) return
                return`I mean, it was so enticing... Reward : you get a new effect for this upgrade`},
        },

        52: {
            name: `Something is very wrong here`,
            done() {return (player.g.unlocked)},
            goalTooltip() {return `Uncover the new layer`},
            doneTooltip() {if (player.shiftin) return
                return`Please beware <br> Reward : Unlock this layer's milestones <br><i>Come on, don't sulk, you will have that upgrade soon</i>`},
        },

        53: {
            name(){if (!hasAchievement('a', 53)) return `No more mister mean guy`
                return `He is fighting back`},
            done() {return (tmp.t.cfb.gte(5))},
            goalTooltip() {if (!hasAchievement('a', 53)) return `Tame Cookie`
                return `Fail at restraining Cookie`},
            doneTooltip() {if (player.shiftin) return
                return`Reward : I fixed the upgrade. At a cost.`},
            onComplete(){player.a.seam = player.a.seam.add(1)},

        },

        54: {
            name: `The four horsemen of whatever that is`,
            done() {return (player.g.chalon.gte(1))},
            goalTooltip() {return `Complete <b>The first challenge</b> once`},
            doneTooltip() {if (player.shiftin) return
                return`Reward: another upgrade, yay.<br><i>That being said you better really be happy about it.</i>`},
        },

        55: {
            name: `The Upgrade Kisser`,
            done() {return (tmp.m.repare.gte(10) && hasUpgrade('t', 54) && hasUpgrade('c', 41))},
            goalTooltip() {return `Cure someone(thing?) in need`},
            doneTooltip() {if (player.shiftin) return
                return`Pervert.`},
        },

        56: {
            name: `[PLACEHOLDER]`,
            done() {return (hasUpgrade('t', 52) && hasAchievement('a', 53))},
            goalTooltip() {return `For whenever that cursed upgrade will be reachable`},
            doneTooltip() {if (player.shiftin) return
                return`Reward: Clue layer will not flash red all the time anymore. <br><i>Oh it already was reachable? Well that's neat.</i>`},
        },



    },

})
//doPopup(style= `default`, text = `This is a test popup.`, title = `?`, timer = 3, color = `#ffbf00`)
