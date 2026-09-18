var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
    showTree: true,

    treeLayout: ""


}


// A "ghost" layer which offsets other layers in the tree
addNode("blank1", {
    position: 3,
    row: 0,
    layerShown() {
        if (hasMilestone("c", 2) || player.a.achievements.includes(20))
            return "ghost"
        return false;
    },
},
)


addLayer("tree-tab", {
    tabFormat: [["tree", function () { return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS) }]],
    previousTab: "",
    leftTab: true,
})