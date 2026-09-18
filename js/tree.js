var layoutInfo = {
    startTab: "none",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
	update(diff){
		if(player.points.gte(new Decimal(308).pentate(2))) player.tab = "none"
	},
tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}], ["infobox", "lore"], "blank", "blank", "blank", "buyables"],
	infoboxes: {
		lore: {
		title() {return player["tree-tab"].points.gte(2) ? "That lazyass" : "████ █████"},
		body() {return player["tree-tab"].points.eq(11) ? "Just click on this buyable one last time and things should revert back to normal." : player["tree-tab"].points.eq(10) ? "Are you ready to continue playing this mod?" : player["tree-tab"].points.eq(9) ? "About right now, don't you worry." : player["tree-tab"].points.eq(8) ? "Hell no. Unless they're made by me, I wouldn't make fun of anyone's mod... At least the ones with bearable amount of timewalls." : player["tree-tab"].points.eq(7) ? "i literally made them for giggles and shit. they only served as meta-irony layers. they'll be no longer relevant from now on." : player["tree-tab"].points.eq(6) ? "Simple. I'll reset the progress you did in 4th Square Expansion in exchange of new content." : player["tree-tab"].points.eq(5) ? "lmao i did. what are you going to do, ask acamaeda to delete this mod?" : player["tree-tab"].points.eq(4) ? "To be honest, I don't know. I was REALLY bored making an update and decided to do some random shenanigans." : player["tree-tab"].points.eq(3) ? "I've hidden all of them from your sight in order to stop YOU from going any further. I also deactivated your nothing AND impatience gain for good measure." : player["tree-tab"].points.eq(2) ? "Yep, that's me." : player["tree-tab"].points.eq(1) ? "I mean, isn't it already obvious who I am here?" : "HEY, THE ONE WHO'S PLAYING THIS MOD. YES, I'M REFERRING TO YOU.<br/><br/><br/><br/><br/>You need to stop doing whatever you're... doing."},
		unlocked() {return player.points.gte(new Decimal(308).pentate(2)) && player["tree-tab"].points.lt(12)},
		}
	},
	buyables: {
		rows: 1,
		cols: 1,
		11: {
			title() {return player["tree-tab"].points.eq(11) ? "Snap back into reality." : player["tree-tab"].points.eq(10) ? "Uh... Yeah, duh? That's why I stayed here, \"talking\" with you and all of that jazz." : player["tree-tab"].points.eq(9) ? "Great!" : player["tree-tab"].points.eq(8) ? "Well, when I'll get to continue playing this mod?" : player["tree-tab"].points.eq(7) ? "Is that an Alphabet Tree reference?" : player["tree-tab"].points.eq(7) ? "Is that an Alphabet Tree reference?" : player["tree-tab"].points.eq(6) ? "What about those TWO layers?" : player["tree-tab"].points.eq(5) ? "Damn, you right... So, uh, what happens next?" : player["tree-tab"].points.eq(4) ? "You did not just make a pun right here." : player["tree-tab"].points.eq(3) ? "But why you made all of that stuff? Why bother wasting fwe hours, creating something stupid and dumb, let alone push the content publically?" : player["tree-tab"].points.eq(2) ? "Alright... I have a question: Where did all layers go!?" : player["tree-tab"].points.gte(1) ? "Oh, Holy Broly... Of all people." : "Hold up, who the hell are you?"},
			canAfford() { return true },
			buy() {
				player["tree-tab"].points = player["tree-tab"].points.add(1)
				if(player["tree-tab"].points.eq(12)) {player.points = new Decimal(0)
												      player.s.points = new Decimal(0)
													  player.i.points = new Decimal(0)
													  player.i.buyables[11] = new Decimal(0)
													  player.i.buyables[12] = new Decimal(0)
												      player.s.upgrades = [11, 12, 21, 22]
													  player.i.upgrades = []
													  player.s2.upgrades = []
													  player.s3.upgrades = []
												      player.s.challenges[11] = 0
												      player.s.challenges[12] = 0
												      player.s.challenges[21] = 0
												      player.s.challenges[22] = 0
													  player["s"].activeChallenge = null}
			},
			unlocked() {return player.points.gte(new Decimal(308).pentate(2)) && player["tree-tab"].points.lt(12)},
			style() { return {
				"font-size": "12px",
				"height": "150px",
				"width": "350px"
				}
			}
			}
	},
})