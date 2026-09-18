function hasUpgrade(layer, id) {
	return ((player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasMilestone(layer, id) {
	return ((player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasAchievement(layer, id) {
	return ((player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasChallenge(layer, id) {
	return ((player[layer].challenges[id]) && !tmp[layer].deactivated)
}

function maxedChallenge(layer, id) {
	return ((player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit) && !tmp[layer].deactivated)
}

function challengeCompletions(layer, id) {
	return (player[layer].challenges[id])
}
//custom
function setChallengeCompletions(layer, id, amt) {
	player[layer].challenges[id] = amt
}

function getBuyableAmount(layer, id) {
	return (player[layer].buyables[id])
}

function setBuyableAmount(layer, id, amt) {
	player[layer].buyables[id] = amt
}

function addBuyables(layer, id, amt) {
	player[layer].buyables[id] = player[layer].buyables[id].add(amt)
}

function getClickableState(layer, id) {
	return (player[layer].clickables[id])
}

function setClickableState(layer, id, state) {
	player[layer].clickables[id] = state
}

function getGridData(layer, id) {
	return (player[layer].grid[id])
}

function setGridData(layer, id, data) {
	player[layer].grid[id] = data
}

function upgradeEffect(layer, id) {
	return (tmp[layer].upgrades[id].effect)
}

function challengeEffect(layer, id) {
	return (tmp[layer].challenges[id].rewardEffect)
}

function buyableEffect(layer, id) {
	return (tmp[layer].buyables[id].effect)
}

function clickableEffect(layer, id) {
	return (tmp[layer].clickables[id].effect)
}

function achievementEffect(layer, id) {
	return (tmp[layer].achievements[id].effect)
}

function gridEffect(layer, id) {
	return (gridRun(layer, 'getEffect', player[layer].grid[id], id))
}

// Custom.

function fixbattery() {
	setBuyableAmount("B", 11, new Decimal(0))
	setBuyableAmount("B", 12, new Decimal(0))
	setBuyableAmount("B", 13, new Decimal(0))
}

function fixfix() {
	player.S.resetTime = 0
	player.M.resetTime = 0
	player.AD.resetTime = 0
}

function inArea(area) {
	if (player.area == area) {
		return true
	} else {
		return false
	}
}

function upgradeLength(layer) {
	return player[layer].upgrades.length
}

function milestoneLength(layer) {
	return player[layer].milestones.length
}

qwerty = 0
function m2anim() {
	if(options['anims']) {
	    qwerty = qwerty + 0.1
	    ytrewq = Math.max(Math.abs(Math.sin(qwerty + 0)), 0.75)
	    document.body.style.setProperty("--m2anim", ytrewq)
	} else {
		document.body.style.setProperty("--m2anim", 1)
	}
}
setInterval(m2anim, 1)

//Copper Particles Handler
function copperpart(){
	if(player.tab=="CO"){
	//equal chance for red, green or blue copper
	let color = ""
	switch(Math.floor(Math.random() * 3)) {
		case 0:
			color = "redcopper"
			break
		case 1:
			color = "greencopper"
			break
		case 2:
			color = "bluecopper"
	}
	let parti = {
   	 image:"resources/"+color+"icon.png",
 	   time: 3,
 	   fadeOutTime: 1,
 	   fadeInTime: 1,
 	   layer: "CO",
  	  width: 50,
  	  height: 50,
  	  xVel: 0,
  	  yVel: 0,
  	  onClick() {
  	  	let mult = new Decimal(1)
  	  	let rank = getBuyableAmount("CO", 12)
  	  	let tier = getBuyableAmount("CO", 13)
  	  	if(rank.gte(1))mult=mult.times(2)
  	  	if(rank.gte(3))mult=mult.times(new Decimal(1.25).pow(rank))
  	  	if(tier.gte(1))mult=mult.times(3)
  	  	//crimson lime sky
  	  	if(color=="redcopper")mult=mult.times(buyableEffect("CO", 21))
  	  	if(color=="greencopper")mult=mult.times(buyableEffect("CO", 22))
  	  	if(color=="bluecopper")mult=mult.times(buyableEffect("CO", 23))
  	  	player.CO[color] = player.CO[color].plus(mult)
  	  	Vue.delete(particles, this.id)
  	  }
	}
	makeShinies(parti)
	}
}
copperinterval = setInterval(copperpart,3000)

//Brought to you by Distance Incremental (Credits)

function newNews() {
	let allnews = [
	"Why am i here...",
	"AntiExcavation Discoveries",
    "Breaking news: No one cares",
    "It's the apocalypse!!",
    "Boring news...",
                     "Its not a collab guys...",
                     "Baba is not you",
                     "Functioning news ticker? No way.",
                     "Why is it exclusive?",
                     "If you are incremental, clap your hands..",
                     "AntimatterettamitnA",
                     "Its sad. :(",
                     "THIS IS COPY!1!1!1 - mobile game ad player",
                     "13, the unlucky number",
                     "Look behind you!",
                     "Can you catch all news messages?",
                     "Its a dream!",
                     "Are you sure about that? Are you-",
                     "Stop. Look up.",
                     "Matter Excavations",
                     "Do not read this news ticker. Please. I am begging you. Too late you are cursed now...",
                     "You need to touch "+format(player.AD.points)+" grass.",
                     "Get softcapped. Wait, actually get HARD RESETED",
                     "Who wrote news tickers? Well it all started with the big bang-",
                     "Do your homework first before playing...",
                     "-.-.-.-.-.-.--.-.-.-.-.-.--.--.----.--.-.-.",
                     "Dont trust them. By them i mean the NEWS TICKERS! But then that means you wont trust this one...",
                     "Did you wait 5 minutes?",
                     "Who is better... CFI... or GCI... or... Both?",
                     "The news ticker before this one was 100% true.",
                     "The news ticker after this is 100% false.",
                     "The news ticker before this is the game's opinion.",
                     "The news ticker after this was written by a child.",
                     "News tickers are 1% faster!",
                     "This was written by an adult. (ReAl)",
                     "Quote the news ticker after this in a messaging app.",
                     "Make sure to hit that subscribe button...",
                     "WHY IS IT NOT SCROLLING :(",
                     "Easy Medium Hard Difficult. Whats next?",
                     "The news ticker before this was a fake one",
                     "The news ticker after this describes the news ticker after it.",
                     "Not stolen from hevi",
                     "True endgame... Is to get all achievements!",
                     "Mercury cannot be colonized as both sides are extremely hot and cold ",
                     "Whoops, were running out of ideas !!",
                     "This is not news at all! It's olds!",
                     "*Insert a funny joke here*",
                     "You better laughed at the previous news ticker.",
                     "FibbonacciccanobbiF",
                     "Dont check out the code for this, its jumbled around",
                     "Halfway from 100! Let's go!!!",
                     "Shoutout to AOAIWJN128J(#82(",
                     "Breaking News: Local man in possesion of antimatter",
                     "Would you rather have no tin or have no stone?",
                     "Why is this here? This aint relevant..",
                     "Never gonna give you up, never gonna let you down",
                     "If you said you were telling lies then when you said that would be a lie..",
                     "Paradox",
                     "2.718281828459045",
                     "What's e^iπ + 1?",
                     "3.14159265",
                     "Wheres Wally?",
                     "Raman Tawer",
                     "Sheesh bro, you played this for "+formatTime(player.timePlayed)+"!?!?",
                     "Super Mario 64",
                     "This isnt excavation is it?",
                     "Too much news for your brain to handle..",
                     "Breaking News: Local airplane spotted with 10 tons of.. sticks?",
                     "Breaking News: Local man spotted stealing "+format(player.TI.points)+" tin!",
                     "Breaking News: Local Tree spotted that has grown "+format(player.TR.points)+" cm!",
                     "Breaking News: Local news ticker spreading fake news. Dont believe everything you see.",
                     "Breaking News: Today we will be repairing news, because someone broke it.",
                     "Are yah sure about that",
                     "Krusty Krab, The most delicious burgers! Call now.",
                     "Krusty Krab, no health inspectors has come in. Call now.",
                     "Simon says... laugh at the news ticker after this one.",
                     "Breaking News: Sticks have been spotted ALOT lately. It was spotted at canals, toilets. And beds!?!?",
                     "Breaking News: Deforestation is at an all-time high. Detectives say that the suspect includes you.",
                     "Breaking News: The earth's stone has been quirking lately. Some say it's the work of... reseting?",
                     "Breaking News: Leaf production from trees is at an all-time world record peak high. These trees are called; The Excavation Trees",
                     "Breaking News: Researchers have been protesting of their minimum-wage salary. Researchers are quitting at a very alarming rate.",
                     "Bnuy was here",
                     "This new virus called Vorona, has been infecting trees lately.",
                     "Breaking News: Local man collecting lots of fame from planting trees.",
                     "Breaking News: Local rainforest spotted with familiar trees from other rainforests. Is it a coincidence!?!?",
                     "Breaking News: Market crashed after alot of tons of tin started to circulate around the world",
                     "Breaking News: National Man electrocuted with "+format(player.B.points)+" watts of electricity.",
                     "Breaking News: Local man finds gold after using a magnet on a tree.",
                     "Breaking News: Local woman invents a way to scale how severe fires are, called stages.",
                     "Breaking News: Miner Comp © finds a cool ton of coal to cook on.",
                     "Breaking News: Local boy manages to research all the internet, gaining lots of tech.",
                     "Breaking News: National Tree spotted, with a whopping length of about 2718281828459045 centimeters.",
                     "Breaking News: Local girl transforms matter into antimatter using the so called Dimensions.",
                     "Raman Tawer: DLC",
                     "Croak or Ribbit?",
                     "Breaking News: Supercomputer built by Mlon Eusk reaches 1 Petabytes of storage. He said that the secret was... Trees.",
                     "Breaking News: Local man claims to have reached all the so-called Milestones, claiming that he beat the fictional Tree.",
                     "Breaking News: : sweN gnikaerB",
                     "Real annoying man. Reaaal annoyiinngg maaannn..",
                     "We couldnt afford 1 more news ticker, sorry for the inconvenience.",
                     "ITS LESS THAN 101!!!!!!",
                     "OBJECTION!",
                     "The Grass Farming Incremental",
                     "Don't you get bored at all?",
                     "Drop it like it's hot",
                     "Minceblox",
                     "The news ticker before this was written by ancient egyptians.",
                     "Let's say you warped back in time and broke a stick...",
                     "Constructing Olds: Local beaver bit off every bit of Miner Comp © refined wood.",
                     "Constructing Olds: Scientists have managed to merge stone and sticks.",
                     "Constructing Olds: Local boy saved about 3 tin cans, and 'sacrificed' them, as he says.",
					 "Constructing Olds: Local florida man sells 100 cloth and becomes rich.",
					 "Constructing Olds: The President of Yugoslavia has entered what they call the 'Static' planet.",
					 "Constructing Olds: Geologists have found weird effects of ethereal sticks while testing.",
					 "Constructing Olds: Local man tried to dig to China; instead found a new metal he called 'Monoium'.",
					 "Constructing Olds: Scientists have proven that chairs have trace amounts of 'Challengerat Experienceiulm'.",
					 "Constructing Olds: Local california man tries to prove that Cheetos are actually 'difficult sticks'.",
					 "Constructing Olds: Local Americanese man discovers a planet called 'Chall-E26-E', after he got out of a local asylum.",
					 "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z AA AB AC AD AE AF AG AH AI AJ AK AL AM AN AO AP AQ AR AS AT AU AV AW AX AY AZ",
					 "This took me hours to get it scrolling.",
					 "In all honesty this specific lexicon jarrs thy eyeballs.",
					 "Okay. Guyse? Pauseth? Pauseth for a second? So I haveth a Laser Pointere. If you could juste... Followe that? Everyone readye? Okaye go.",
					 "Step 1: Recycle | Step 2: Reduce | Step 3: Reuse | Step 4: Repurpose | Step 5: Release | Step 6: Repeat | Step 7: Restep | Step 8: Resoftcap",
					 "Today I will be explaining how to beat 'The Excavation Tree'. But first let's talk about parallel universes.",
					 "Hey, MSauce, Vichael here. Your tree security looks great. Or is it?",
					 "Normalizing Modernity: Gill Bates have discovered 'Stickbits', which he says are better than 'Qubits'.",
					 "Normalizing Modernity: Beff Jezos has started to mass produce "+format(player.W.points.pow(0.5))+" wooden-based phones.",
					 "Normalizing Modernity: Local man Flo Rida has struck oil after mining through "+format(player.ST.points.pow(2))+" tons of rock underground.",
					 "Normalizing Modernity: Local man Mlon Eusk started underpaying his researchers.",
					 "Normalizing Modernity: Local rat has successfully eaten all the leaves on a tree after a whopping "+format(player.L.points.pow(0.5))+" years.",
					 "Hey KSauce, Vevin here. Let's talk about parallel trees.",
					 "QWERTYUIOPASDFGHJKLZXCVBNM",
					 "Click on this text to get 2x more antimatter!                                                                           Gullible.",
					 "Raid Shadow Legends - mobile game ad player",
					 "I tried so hard and got so far, but in the end, it doesn't antimatter - Hevipelle",
					 "If you see this message, you had a 1 in 1,000,000 chance of seeing this! I think - Liar Door",
					 "The other door lies. The other tells the truth. Choose wisely and you may continue your quest.",
					 "It's not called excavation matter dimensions is it?"
	]
	return allnews[Math.floor(Math.random() * allnews.length)]
}

newsTimeouts = []
function newsticking() {
	for (let i=0;i<newsTimeouts.length;i++) {
		clearTimeout(newsTimeouts[i])
		delete newsTimeouts[i]
	}
	let s = document.getElementById("news")
    s.innerHTML = newNews()
    let parentWidth = s.parentElement.clientWidth
    s.style.transition = ''
    s.style.transform = 'translateX('+parentWidth+'px)'
    newsTimeouts.push(setTimeout( function() {
		let dist = s.parentElement.clientWidth + s.clientWidth + 20
		let rate = 100
		let transformDuration = dist / rate
		s.style.transition = 'transform '+transformDuration+'s linear'
		let textWidth = s.clientWidth
		s.style.transform = 'translateX(-'+(textWidth+5)+'px)'
		newsTimeouts.push(setTimeout(function() {
			s.innerHTML = ""
			newsticking()
		}, Math.ceil(transformDuration * 1000)))
	}, 100))
}