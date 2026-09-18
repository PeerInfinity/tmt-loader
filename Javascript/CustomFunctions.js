function notify(text, title, timer = 5, color) {
    doPopup("none", text, title, timer, color)
}

async function replayContent(id) {
    switch (id) {
        case "tutorial":
            notify("You actually need a tutorial for a prestige tree mod? Pathetic human, there is no special gimmicks in this here mod...", "D-Glung", 6, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "hint":
            notify("Check layers often for new content, especially after destroying some universes. Not all buffs can be listed in one line of text many times later on...", "D-Glung", 7, "crimson")
            await wait(5000)
            notify("This one is actually more reasonable than trying to give you a tutorial human.", "D-Glung", 6, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "branching":
            notify("As my sole assistant, you'll come across many... anomalies in this reality. Most will be happy to help you, even if they don't know what the endgoal is.", "D-Glung", 7, "crimson")
            await wait(6000)
            notify("Of course the ones that'll help you would have layers that branch off the initial one. But those are the ones that the Multiversal Branches aren't referring to.", "D-Glung", 7, "crimson")
            await wait(6000)
            notify("The one that it's actually about is the branches that trail down the first 'split', usually starting just after the 'M' node and leading downwards.", "D-Glung", 6, "crimson")
            await wait(6000)
            notify("Bonuses you aquire down these branches only affect the layers included in these branches, eventually leading up back to the 'M' node most of the time.", "D-Glung", 6, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "anger":
            notify("What? This is new.", "D-Glung", 3, "crimson")
            await wait(2000)
            notify("I'm not sure what this anger belongs to, but it appears to grow exponentially over time as you destroy more universes.", "D-Glung", 5, "crimson")
            await wait(6000)
            notify("I just hope this doesn't hinder us on our way to something far greater...", "D-Glung", 4, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "layer prestige":
            notify("Those room expansions are starting to get real expensive real quick so I've improvised a new feature.", "D-Glung", 5, "crimson")
            await wait(5000)
            notify("You can now prestige the layer at a cost of resetting all progress made on it. It's rather harsh in the beginning but it's worth it later on.", "D-Glung", 6, "crimson")
            await wait(5500)
            notify("The only problem is that collecting the essence needed is very tedious as it nerfs itself the more you currently have.", "D-Glung", 5, "crimson")
            await wait(5000)
            notify("Eventually it will be very helpful and you can automate it soon.", "D-Glung", 3, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "sorbetINTRO":
            notify("Hello again human. As you can see, I have employed some... help.", "D-Glung", 3.5, "crimson")
            await wait(3000)
            notify("This \"Sorbet\" being claims to be human just like you, but it's appearance suggests otherwise...", "D-Glung", 5, "crimson")
            await wait(4250)
            notify("He claims to have knowledge of strange, sticky materials. He also says to not try to interact with the substance yourself", "D-Glung", 6, "crimson")
            await wait(5000)
            notify("Hehe, I hope my friends can help too human...", "Sorbet", 3, "ghostwhite")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "branching2":
            notify("I have returned to clarify the transition nodes you've been working with", "D-Glung", 3.7, "crimson")
            await wait(3500)
            notify("The nodes labeled \"transition node\" are able to boost other nodes in that row.", "D-Glung", 4, "crimson")
            await wait(3500)
            notify("Thanks for attending the ted talk...", "D-Glung", 2.5, "crimson")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
            break;
        case "colin":
            notify("So Colin, you finally came after a bit.", "Sorbet", 3, "ghostwhite")
            await wait(1500)
            notify("Wait Sorbet, who is this being again? I forget quite often, especially after living for so long.", "D-Glung", 4.2, "crimson")
            await wait(4000)
            notify("A friend of mine's obviously. Why would I not invite them.", "Sorbet", 3.5, "ghostwhite")
            player.dialoguesTriggered = player.dialoguesTriggered.add(1)
    }
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function jarbler(input, template = "abcdefghijklmnopqrstuvwxyz") {
    output = ""

    for (let i = 0; i < input.length; i++) {
        if (input[i] != " ") { 
            output += template[Math.floor(Math.random() * template.length)]
        } else {
            output += " "
        }
    }
    return output
}

/**
Character Colors:

 * DGung - Crimson
 * Sorbet - Ghostwhite
 * Colin - A31 (Dark Orange)
 **/

async function insertCharText(input, up = false) {
    if (input == "CLEAR") {
        player.lam.inputText = ``
    } else {
        if (input == "ENTER") {
            switch (player.lam.inputText) {
                
            }
            insertCharText("CLEAR")
        } else {
            if (input == " ") {
                player.lam.inputText += ` `
            } else {
                if (up == true) {
                    player.lam.inputText += input.toUpperCase()
                } else {
                    player.lam.inputText += input
                }
            }
        }
    }
}