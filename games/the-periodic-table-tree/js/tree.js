var layoutInfo = {
    startTab: "Per",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,

    clickables: {
        pause: {
            display: '||',
            canClick() { if (player.C.Lol < 3) return tmp.C.OnOff != 0 },
            onClick() { if (player.C.Lol < 3) tmp.C.OnOff = tmp.C.OnOff.times(0)},
            style: { 'width': '40px', 'min-height': '20px' }
        },
        play: {
            display: '▶',
            canClick() { if (player.C.Lol < 3) return tmp.C.OnOff != 1 },
            onClick() { if (player.C.Lol < 3) tmp.C.OnOff = tmp.C.OnOff.add(1)},
            style: { 'width': '40px', 'min-height': '20px' }
        },
    },
})