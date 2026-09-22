const layoutInfo = {
  startTab: "none",
  startNavTab: "tree-tab",
  showTree: true,
};

addLayer("tree-tab", {
  tabFormat: [["tree", () => TREE_LAYERS]],
  previousTab: "",
  leftTab: true,
});
