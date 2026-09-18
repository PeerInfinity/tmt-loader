    addLayer("lore", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        best:new Decimal(0),
        lT: 0,
        currReq:0,
        layerReq:0,
        currentColor:"#98f898",
        lc: 0,//我寻思我也不会写 1.79e308篇故事//但是没准职能会被points取代//好吧还是有点作用的
    }},

    name: "Lore", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L",
    color() {return GlowingColor("#ff0000",10,"#00ff00",10,"#0000ff")},       // The color for this layer, which affects many elements.
    type: "none",//不被重置
    row: "side",
    position:4,

    unlocked()  {return true},
    layerShown() { return true},
    shouldNotify(){
        return player.lore.lT<layers.lorer.currReq()&&player.tab!='lore'
    },

      infoboxes: {
        story: {
            title() {
                if (player.lore.lc==0) return "Ch.1: The Great Creation";
                if (player.lore.lc==1) return "Ch.2: Primordial Existence";
                if (player.lore.lc==2) return "Ch.3: Space and Time";
                if (player.lore.lc==3) return "Ch.4: Black Hole?";
                if (player.lore.lc==4) return "Ch.5: Aetherized";
                if (player.lore.lc==5) return "Ch.6: The Powers of Force";
                return "Stories";
            },
            body() {
                if (player.lore.lc==0){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                };
                if (player.lore.lc==1){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                };
                if (player.lore.lc==2){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                };
                if (player.lore.lc==3){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                };
                if (player.lore.lc==4){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                }; 
                if (player.lore.lc==5){
                    let story = "This chapter of lore in plan, so it haven't even been written.";
                    return story;
                }; 
            },
        unlocked(){true},
        titleStyle(){return {'background-color':layers.lore.currentColor()} },
        bodyStyle: {'text-align':'left'},
        },
    },

    update(diff){
        if (!player[this.layer].unlocked) player[this.layer].loreTimer = 0;
        else if(player[this.layer].lore<layers.lore.currReq()&&player.tab=='lore') player[this.layer].loreTimer += diff;
    },

    doReset(resettingLayer){},

    currReq(){//use layers
        let req = 0;
        //在这里插入每个故事走到头要多长时间
        if (player.lore.lc==0) req = 60;
        if (player.lore.lc==1) req = 60;
        if (player.lore.lc==2) req = 75;
        if (player.lore.lc==3) req = 90;
        if (player.lore.lc==4) req = 75;
        if (player.lore.lc==5) req = 75;
        return req;
    },
    currentColor(){
        let color = "#98f898";
        if (player.lore.lcolor==0) color = "#00bdf9";
        if (player.lore.lc==1) color = "#FFFFFF";
        if (player.lore.lc==2) color = "#5E33FF";
        if (player.lore.lc==3) color = "#222222";
        if (player.lore.lc==4) color = "#BB00BB";
        if (player.lore.lc==5) color = "#ffe6f6";
        return color;
    },
    tabFormat: [
        "blank", 
        "clickables",
        ["infobox","story",{'border-color':function(){return layers.lore.currentColor()}}],
        ["bar","storybar"],
        "upgrades",
    ],

    bars: {
        lorebar: {
            direction: RIGHT,
            width: 500,
            height: 10,
            progress() { return player.lore.lT/(layers.lore.currReq()) },
            barcolor() {
                return layers.lore.currentColor();
            },
            fillStyle(){return {'background-color':layers[this.layer].bars.lorebar.barcolor()}},
        },
    },

    clickables: {
        rows: 1,
        cols: 2,
        11: {
            title: "",
            display: "←",
            unlocked() { return player.lore.unlocked },
            canClick() { return player.lore.lc>0 },
            onClick() { 
                player.lore.lc -= 1;
                player.lore.lT = layers.lore.currReq();
            },
            style: {"height": "50px", "width": "50px","min-height":"50px",},
        },
        12: {
            title: "",
            display: "→",
            unlocked() { return player.lore.unlocked},
            canClick() { return player.lore.points.gt(player.lore.lc)&&!(player.lore.lc==5) },
            onClick() { 
                player.lore.lc += 1;
                if(player.lore.points.eq(player.lore.lc)) player.lore.lT = 0;
                else player.lore.lT  = layers.lore.currReq();
            },
            style: {"height": "50px", "width": "50px","min-height":"50px",},
        },
    },
    })
