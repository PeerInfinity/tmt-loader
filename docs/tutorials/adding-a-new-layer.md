# Adding a new Layer
This guide will guide you through making a new layer, adding an effect to it and some other stuff. It assumes you've already completed the [Making a Mod](making-a-mod.md) tutorial, and builds on what you've made so far.

## Creating the layer
Just like in the previous tutorial, head to layers.js, where all the layers are stored. Copy-paste the Prestige layer under the last line (which should be `})`). Since you're creating a new layer that isn't a duplicate of the previous one, you'll need to change a few things.

First of all, you'll need to delete the `upgrades` object (in the bottom layer), this removes all the upgrades from the layer you're making. Then, make the `row` 1 instead of 0. Finally, change the "p" in the second addLayer to "m", which changes the layer's ID.

Reload to see your new layer! However, there's a lot of similarities to the first layer and things you want to change. How do you make the node different? How do you connect the two layers together?

Let's start by making the layer different than the prestige one. First, we need to come up with a name for the layer. Multipliers are a pretty neat name, so let's use that. Change all instances of "prestige" and "prestige points" in the layer to "multipliers" (not "multiplier points"), and change the layer symbol from P to M. Be sure to change the hotkey as well (you don't need to change `onPress`, it'll still work). As for the color, you'll need to change the `color` property. This tutorial is going to use #ffae00, but you can use whichever you want. Reload, and the layer now looks way better!

As for connecting the layers together, you'll need to put a `branches` property after `layerShown()` (make sure there's a comma after the final } on the `layerShown` line):

```js
branches: ["p"],
```

Now the layers are connected!

## Making it harder to Multiplier Reset
You'll notice that it's very easy to prestige in the Multiplier layer. That's 
