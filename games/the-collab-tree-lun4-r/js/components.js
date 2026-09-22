let app;

function loadVue() {
  Vue.component("display-text", {
    props: ["layer", "data"],
    template: `
			<span class="instant" v-html="data"></span>
		`,
  });

  Vue.component("raw-html", {
    props: ["layer", "data"],
    template: `
				<span class="instant"  v-html="data"></span>
			`,
  });

  Vue.component("blank", {
    props: ["layer", "data"],
    template: `
			<div class="instant">
			<div class="instant" v-if="!data" v-bind:style="{'width': '8px', 'height': '17px'}"></div>
			<div class="instant" v-else-if="Array.isArray(data)" v-bind:style="{'width': data[0], 'height': data[1]}"></div>
			<div class="instant" v-else v-bind:style="{'width': '8px', 'height': data}"><br></div>
			</div>
		`,
  });

  Vue.component("display-image", {
    props: ["layer", "data"],
    template: `
			<img class="instant" :src="data" :alt="data" />
		`,
  });

  Vue.component("row", {
    props: ["layer", "data"],
    template: `
		<div class="upgTable instant">
			<div class="upgRow">
				<div v-for="(item, index) in data">
				    <div v-if="!Array.isArray(item)" :is="item" :layer="layer" :style="tmp[layer].componentStyles[item]" :key="index"></div>
				    <div v-else-if="item.length === 3" :style="[tmp[layer].componentStyles[item[0]], item[2] ?? {}]" :is="item[0]" :layer="layer" :data="item[1]" :key="index"></div>
				    <div v-else-if="item.length === 2" :is="item[0]" :layer="layer" :data="item[1]" :style="tmp[layer].componentStyles[item[0]]" :key="index"></div>
			    </div>
			</div>
		</div>
		`,
  });

  Vue.component("column", {
    props: ["layer", "data"],
    template: `
		<div class="upgTable instant">
			<div class="upgCol">
				<div v-for="(item, index) in data">
					<div v-if="!Array.isArray(item)" :is="item" :layer= "layer" :style="tmp[layer].componentStyles[item]" :key="index"></div>
					<div v-else-if="item.length === 3" :style="[tmp[layer].componentStyles[item[0]], item[2] ?? {}]" :is="item[0]" :layer= "layer" :data="item[1]" :key="index"></div>
					<div v-else-if="item.length === 2" :is="item[0]" :layer="layer" :data="item[1]" :style="tmp[layer].componentStyles[item[0]]" :key="index"></div>
				</div>
			</div>
		</div>
		`,
  });

  Vue.component("layer-proxy", {
    props: ["layer", "data"],
    template: `<column :layer="data[0]" :data="data[1]"></column>`,
  });
  Vue.component("infobox", {
    props: ["layer", "data"],
    template: `
		<div class="story instant" v-if="tmp[layer].infoboxes[data].unlocked" :style="[{borderColor: tmp[layer].color, borderRadius: player.infoboxes[layer][data] ? 0 : '8px'}, tmp[layer].infoboxes[data].style]">
			<button class="story-title" :style="[{backgroundColor: tmp[layer].color}, tmp[layer].infoboxes[data].titleStyle]"
				@click="player.infoboxes[layer][data] = !player.infoboxes[layer][data]">
				<span class="story-toggle">{{player.infoboxes[layer][data] ? "+" : "-"}}</span>
				<span v-html="tmp[layer].infoboxes[data].title"></span>
			</button>
			<div v-if="!player.infoboxes[layer][data]" class="story-text" v-bind:style="tmp[layer].infoboxes[data].bodyStyle">
				<span v-html="tmp[layer].infoboxes[data].body"></span>
			</div>
		</div>
		`,
  });

  Vue.component("h-line", {
    template: `<hr class="instant" :style="data ? {width: data} : {}" class="hl">`,
  });

  Vue.component("v-line", {
    template: `<div class="instant" v-bind:style="data ? {'height': data} : {}" class="vl2"></div>`,
  });

  Vue.component("challenges", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].challenges" class="upgTable">
		<div v-for="row in (data === undefined ? tmp[layer].challenges.rows : data)" class="upgRow">
		<div v-for="col in tmp[layer].challenges.cols">
					<challenge v-if="tmp[layer].challenges[row * 10 + col].unlocked" :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.challenge"></challenge>
				</div>
			</div>
		</div>
		`,
  });

  Vue.component("challenge", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].challenges[data].unlocked && !(options.hideChallenges && maxedChallenge(layer, [data]) && !inChallenge(layer, [data]))"
			:class="['challenge', challengeStyle(layer, data), player[layer].activeChallenge === data ? 'resetNotify' : '']" v-bind:style="tmp[layer].challenges[data].style">
			<br><h3 v-html="tmp[layer].challenges[data].name"></h3><br><br>
			<button :class="{ longUpg: true, can: true, [layer]: true }" :style="{backgroundColor: tmp[layer].color}" @click="startChallenge(layer, data)">{{challengeButtonText(layer, data)}}</button><br><br>
			<span v-if="layers[layer].challenges[data].fullDisplay" v-html="run(layers[layer].challenges[data].fullDisplay, layers[layer].challenges[data])"></span>
			<span v-else>
				<span v-html="tmp[layer].challenges[data].challengeDescription"></span><br>
				Goal:  <span v-html="tmp[layer].challenges[data].goalDescription"></span><span v-else>{{format(tmp[layer].challenges[data].goal)}} {{tmp[layer].challenges[data].currencyDisplayName ? tmp[layer].challenges[data].currencyDisplayName : modInfo.pointsName}}</span><br>
				Reward: <span v-html="tmp[layer].challenges[data].rewardDescription"></span><br>
				<span>Currently: <span v-html="(tmp[layer].challenges[data].rewardDisplay) ? (run(layers[layer].challenges[data].rewardDisplay, layers[layer].challenges[data])) : format(tmp[layer].challenges[data].rewardEffect)"></span></span>
			</span>
			<node-mark :layer="layer" :data="tmp[layer].challenges[data].marked" :offset="20" :scale="1.5"></node-mark></span>
		</div>
		`,
  });

  Vue.component("upgrades", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].upgrades" class="upgTable">
			<div v-for="row in (data ?? tmp[layer].upgrades.rows)" class="upgRow">
				<div v-for="col in tmp[layer].upgrades.cols"><div v-if="tmp[layer].upgrades[row * 10 + col].unlocked" class="upgAlign">
					<upgrade :layer="layer" :data="row * 10 + col" v-bind:style="tmp[layer].componentStyles.upgrade"></upgrade>
				</div></div>
			</div>
			<br>
		</div>
		`,
  });

  Vue.component("upgrade", {
    props: ["layer", "data"],
    template: `
		<button v-if="tmp[layer].upgrades[data].unlocked" :id='"upgrade-" + layer + "-" + data' @click="buyUpg(layer, data)" :class="{ [layer]: true, tooltipBox: true, upg: true, bought: hasUpgrade(layer, data), locked: (!(canAffordUpgrade(layer, data))&&!hasUpgrade(layer, data)), can: (canAffordUpgrade(layer, data)&&!hasUpgrade(layer, data))}"
			:style="[((!hasUpgrade(layer, data) && canAffordUpgrade(layer, data)) ? {backgroundColor: tmp[layer].color} : {}), tmp[layer].upgrades[data].style]">
			<span v-if="layers[layer].upgrades[data].fullDisplay" v-html="run(layers[layer].upgrades[data].fullDisplay, layers[layer].upgrades[data])"></span>
			<span v-else>
				<h3 v-html="tmp[layer].upgrades[data].title"></h3><br>
				<span v-html="tmp[layer].upgrades[data].description"></span>
				<span v-if="layers[layer].upgrades[data].effectDisplay"><br>Currently: <span v-html="run(layers[layer].upgrades[data].effectDisplay, layers[layer].upgrades[data])"></span></span>
				<br><br>Cost: {{ formatWhole(tmp[layer].upgrades[data].cost) }} {{(tmp[layer].upgrades[data].currencyDisplayName ? tmp[layer].upgrades[data].currencyDisplayName : tmp[layer].resource)}}
			</span>
			<tooltip v-if="tmp[layer].upgrades[data].tooltip" :text="tmp[layer].upgrades[data].tooltip"></tooltip>
			</button>
		`,
  });

  Vue.component("milestones", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].milestones">
			<table>
				<tr v-for="id in (data ?? Object.keys(tmp[layer].milestones))" v-if="tmp[layer].milestones[id]!== undefined && tmp[layer].milestones[id].unlocked && milestoneShown(layer, id)">
					<milestone :layer="layer" :data="id" :style="tmp[layer].componentStyles.milestone"></milestone>
				</tr>
			</table>
			<br>
		</div>
		`,
  });

  Vue.component("milestone", {
    props: ["layer", "data"],
    template: `
		<td v-if="milestoneShown(layer, data) && tmp[layer].milestones[data].unlocked" v-bind:style="[tmp[layer].milestones[data].style]" v-bind:class="{milestone: !hasMilestone(layer, data), tooltipBox: true, milestoneDone: hasMilestone(layer, data)}">
			<h3 v-html="tmp[layer].milestones[data].requirementDescription"></h3><br>
			<span v-html="run(layers[layer].milestones[data].effectDescription, layers[layer].milestones[data])"></span><br>
			<tooltip v-if="tmp[layer].milestones[data].tooltip" :text="tmp[layer].milestones[data].tooltip"></tooltip>
		<span v-if="(tmp[layer].milestones[data].toggles)&&(hasMilestone(layer, data))" v-for="toggle in tmp[layer].milestones[data].toggles"><toggle :layer= "layer" :data= "toggle" v-bind:style="tmp[layer].componentStyles.toggle"></toggle>&nbsp;</span></td></tr>
		`,
  });

  Vue.component("toggle", {
    props: ["layer", "data"],
    template: `
		<button class="smallUpg can" :style="{backgroundColor: tmp[data[0]].color}" @click="toggleAuto(data)">{{player[data[0]][data[1]]?"ON":"OFF"}}</button>
		`,
  });

  Vue.component("prestige-button", {
    props: ["layer", "data"],
    template: `
		<button v-if="(tmp[layer].type !== 'none')" :class="{ [layer]: true, reset: true, locked: !tmp[layer].canReset, can: tmp[layer].canReset}"
			:style="[tmp[layer].canReset ? {backgroundColor: tmp[layer].color} : {}, tmp[layer].componentStyles['prestige-button']]"
			v-html="prestigeButtonText(layer)" @click="doReset(layer)">
		</button>
		`,
  });

  Vue.component("main-display", {
    props: ["layer", "data"],
    template: `
		<div><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': tmp[layer].color, 'text-shadow': '0px 0px 10px ' + tmp[layer].color}">{{data ? format(player[layer].points, data) : formatWhole(player[layer].points)}}</h2> {{tmp[layer].resource}}<span v-if="layers[layer].effectDescription">, <span v-html="run(layers[layer].effectDescription, layers[layer])"></span></span><br><br></div>
		`,
  });

  Vue.component("resource-display", {
    props: ["layer"],
    template: `
		<div style="margin-top: -13px">
			<br>You have {{formatWhole(tmp[layer].baseAmount)}} {{tmp[layer].baseResource}}
			<span v-if="tmp[layer].passiveGeneration"><br>You are gaining {{format(tmp[layer].resetGain.times(tmp[layer].passiveGeneration))}} {{tmp[layer].resource}} per second</span>
			<br><br>
			<span v-if="tmp[layer].showBest">Your best {{tmp[layer].resource}} is {{formatWhole(player[layer].best)}}<br></span>
			<span v-if="tmp[layer].showTotal">You have made a total of {{formatWhole(player[layer].total)}} {{tmp[layer].resource}}<br></span>
		</div>
		`,
  });

  Vue.component("buyables", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].buyables" class="upgTable">
			<respec-button v-if="tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)" :layer = "layer" v-bind:style="[{'margin-bottom': '12px'}, tmp[layer].componentStyles['respec-button']]"></respec-button>
			<div v-for="row in (data ?? tmp[layer].buyables.rows)" class="upgRow">
				<div v-for="col in tmp[layer].buyables.cols"><div v-if="tmp[layer].buyables[row * 10 + col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<buyable :layer="layer" :data="row * 10 + col"></buyable>
				</div></div>
				<br>
			</div>
		</div>
	`,
  });

  Vue.component("buyable", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].buyables[data].unlocked" style="display: grid">
			<button :class="{ buyable: true, tooltipBox: true, can: tmp[layer].buyables[data].canBuy, locked: !tmp[layer].buyables[data].canBuy, bought: player[layer].buyables[data].gte(tmp[layer].buyables[data].purchaseLimit)}"
			:style="[tmp[layer].buyables[data].canBuy ? {'background-color': tmp[layer].color} : {}, tmp[layer].componentStyles.buyable, tmp[layer].buyables[data].style]"
			@click="if(!interval) buyBuyable(layer, data)" :id='"buyable-" + layer + "-" + data' @mousedown="start" @mouseleave="stop" @mouseup="stop" @touchstart="start" @touchend="stop" @touchcancel="stop">
				<h2 v-html="tmp[layer].buyables[data].title"></h2><br>
				<span :style="{'white-space': 'pre-line'}" v-html="run(layers[layer].buyables[data].display, layers[layer].buyables[data])"></span>
				<node-mark :layer="layer" :data="tmp[layer].buyables[data].marked"></node-mark>
				<tooltip v-if="tmp[layer].buyables[data].tooltip" :text="tmp[layer].buyables[data].tooltip"></tooltip>
			</button>
			<br v-if="(tmp[layer].buyables[data].sellOne !== undefined && !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)) || (tmp[layer].buyables[data].sellAll && !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false))">
			<sell-one :layer="layer" :data="data" :style="tmp[layer].componentStyles['sell-one']" v-if="(tmp[layer].buyables[data].sellOne)&& !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)"></sell-one>
			<sell-all :layer="layer" :data="data" :style="tmp[layer].componentStyles['sell-all']" v-if="(tmp[layer].buyables[data].sellAll)&& !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false)"></sell-all>
		</div>
		`,
    data() {
      return {
        interval: false,
        time: 0,
      };
    },
    methods: {
      start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
          if (this.time >= 5) buyBuyable(this.layer, this.data);
          this.time++;
        }, 50);
      },
      stop() {
        clearInterval(this.interval);
        this.interval = false;
        this.time = 0;
      },
    },
  });

  Vue.component("respec-button", {
    props: ["layer", "data"],
    template: `
			<div v-if="tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)">
				<div class="tooltipBox respecCheckbox"><input type="checkbox" v-model="player[layer].noRespecConfirm" ><tooltip v-bind:text="'Disable respec confirmation'"></tooltip></div>
				<button @click="respecBuyables(layer)" :class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }" style="margin-right: 18px">{{tmp[layer].buyables.respecText ? tmp[layer].buyables.respecText : "Respec"}}</button>
			</div>
			`,
  });

  Vue.component("clickables", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].clickables" class="upgTable">
			<master-button v-if="tmp[layer].clickables.masterButtonPress && !(tmp[layer].clickables.showMasterButton !== undefined && tmp[layer].clickables.showMasterButton == false)" :layer = "layer" v-bind:style="[{'margin-bottom': '12px'}, tmp[layer].componentStyles['master-button']]"></master-button>
			<div v-for="row in (data ?? tmp[layer].clickables.rows)" class="upgRow">
				<div v-for="col in tmp[layer].clickables.cols"><div v-if="tmp[layer].clickables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<clickable :layer="layer" :data="row * 10 + col" :style="tmp[layer].componentStyles.clickable"></clickable>
				</div></div>
				<br>
			</div>
		</div>
	`,
  });

  Vue.component("clickable", {
    props: ["layer", "data"],
    template: `
		<button 
			v-if="tmp[layer].clickables && tmp[layer].clickables[data]!== undefined && tmp[layer].clickables[data].unlocked" 
			:class="{ upg: true, tooltipBox: true, can: tmp[layer].clickables[data].canClick, locked: !tmp[layer].clickables[data].canClick}"
			:style="[tmp[layer].clickables[data].canClick ? {'background-color': tmp[layer].color} : {}, tmp[layer].clickables[data].style]"
			@click="if(!interval) clickClickable(layer, data)" @mousedown="start" @mouseleave="stop" @mouseup="stop" @touchstart="start" @touchend="stop" @touchcancel="stop">
			<h2 v-html="tmp[layer].clickables[data].title"></h2><br>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="run(layers[layer].clickables[data].display, layers[layer].clickables[data])"></span>
			<node-mark :layer='layer' :data='tmp[layer].clickables[data].marked'></node-mark>
			<tooltip v-if="tmp[layer].clickables[data].tooltip" :text="tmp[layer].clickables[data].tooltip"></tooltip>

		</button>
		`,
    data() {
      return {
        interval: false,
        time: 0,
      };
    },
    methods: {
      start() {
        if (!this.interval && layers[this.layer].clickables[this.data].onHold) {
          this.interval = setInterval(() => {
            const c = tmp[this.layer].clickables[this.data];
            if (this.time >= 5 && c.canClick) {
              run(c.onHold, c);
            }
            this.time++;
          }, 50);
        }
      },
      stop() {
        clearInterval(this.interval);
        this.interval = false;
        this.time = 0;
      },
    },
  });

  Vue.component("grid", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].grid" class="upgTable">
			<div v-for="row in (data ?? tmp[layer].grid.rows)" class="upgRow">
				<div v-for="col in tmp[layer].grid.cols"><div v-if="run(layers[layer].grid.getUnlocked, layers[layer].grid, row*100+col)"
					class="upgAlign" v-bind:style="{margin: '1px', height: 'inherit'}">
					<gridable :layer="layer" :data="row * 100 + col" :style="tmp[layer].componentStyles.gridable"></gridable>
				</div></div>
				<br>
			</div>
		</div>
	`,
  });

  Vue.component("gridable", {
    props: ["layer", "data"],
    template: `
		<button 
		v-if="tmp[layer].grid && player[layer].grid[data]!== undefined && run(layers[layer].grid.getUnlocked, layers[layer].grid, data)" 
		:class="{ tile: true, can: canClick, locked: !canClick, tooltipBox: true,}"
		:style="[canClick ? {'background-color': tmp[layer].color} : {}, gridRun(layer, 'getStyle', player[this.layer].grid[this.data], this.data)]"
		@click="clickGrid(layer, data)"  @mousedown="start" @mouseleave="stop" @mouseup="stop" @touchstart="start" @touchend="stop" @touchcancel="stop">
			<h3 v-html="gridRun(this.layer, 'getTitle', player[this.layer].grid[this.data], this.data)"></h3><br>
			<span :style="{whiteSpace: 'pre-line'}" v-html="gridRun(this.layer, 'getDisplay', player[this.layer].grid[this.data], this.data)"></span>
			<tooltip v-if="layers[layer].grid.getTooltip" :text="gridRun(this.layer, 'getTooltip', player[this.layer].grid[this.data], this.data)"></tooltip>
		</button>
		`,
    data() {
      return {
        interval: false,
        time: 0,
      };
    },
    computed: {
      canClick() {
        return gridRun(
          this.layer,
          "getCanClick",
          player[this.layer].grid[this.data],
          this.data,
        );
      },
    },
    methods: {
      start() {
        if (!this.interval && layers[this.layer].grid.onHold) {
          this.interval = setInterval(() => {
            if (
              this.time >= 5 &&
              gridRun(
                this.layer,
                "getCanClick",
                player[this.layer].grid[this.data],
                this.data,
              )
            ) {
              gridRun(
                this.layer,
                "onHold",
                player[this.layer].grid[this.data],
                this.data,
              );
            }
            this.time++;
          }, 50);
        }
      },
      stop() {
        clearInterval(this.interval);
        this.interval = false;
        this.time = 0;
      },
    },
  });

  Vue.component("microtabs", {
    props: ["layer", "data"],
    computed: {
      currentTab() {
        return player.subtabs[layer][data];
      },
    },
    template: `
		<div v-if="tmp[layer].microtabs" :style="{borderStyle: 'solid'}">
			<div class="upgTable instant">
				<tab-buttons :layer="layer" :data="tmp[layer].microtabs[data]" :name="data" v-bind:style="tmp[layer].componentStyles['tab-buttons']"></tab-buttons>
			</div>
			<layer-tab v-if="tmp[layer].microtabs[data][player.subtabs[layer][data]].embedLayer" :layer="tmp[layer].microtabs[data][player.subtabs[layer][data]].embedLayer" :embedded="true"></layer-tab>
			<column v-else v-bind:style="tmp[layer].microtabs[data][player.subtabs[layer][data]].style" :layer="layer" :data="tmp[layer].microtabs[data][player.subtabs[layer][data]].content"></column>
		</div>
		`,
  });

  Vue.component("bar", {
    props: ["layer", "data"],
    computed: {
      style() {
        return constructBarStyle(this.layer, this.data);
      },
    },
    template: `
		<div v-if="tmp[layer].bars[data].unlocked" v-bind:style="{'position': 'relative'}"><div v-bind:style="[tmp[layer].bars[data].style, style.dims, {'display': 'table'}]">
			<div class="overlayTextContainer barBorder" v-bind:style="[tmp[layer].bars[data].borderStyle, style.dims]">
				<span class="overlayText" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].textStyle]" v-html="run(layers[layer].bars[data].display, layers[layer].bars[data])"></span>
			</div>
			<div class ="barBG barBorder" :style="[tmp[layer].bars[data].style, tmp[layer].bars[data].baseStyle, tmp[layer].bars[data].borderStyle,  style.dims]">
				<div class="fill" :style="[tmp[layer].bars[data].style, tmp[layer].bars[data].fillStyle, style.fillDims]"></div>
			</div>
		</div></div>
		`,
  });

  Vue.component("achievements", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].achievements" class="upgTable">
			<div v-for="row in (data ?? tmp[layer].achievements.rows)" class="upgRow">
				<div v-for="col in tmp[layer].achievements.cols"><div v-if="tmp[layer].achievements[row*10+col]!== undefined && tmp[layer].achievements[row*10+col].unlocked" class="upgAlign">
					<achievement :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.achievement"></achievement>
				</div></div>
			</div>
			<br>
		</div>
		`,
  });

  Vue.component("achievement", {
    props: ["layer", "data"],
    template: `
		<div v-if="tmp[layer].achievements[data].unlocked" v-bind:class="{ [layer]: true, achievement: true, tooltipBox:true, locked: !hasAchievement(layer, data), bought: hasAchievement(layer, data)}"
			:style="achievementStyle(layer, data)">
			<tooltip :text="
			(tmp[layer].achievements[data].tooltip == '') ? false : hasAchievement(layer, data) ? (tmp[layer].achievements[data].doneTooltip ? tmp[layer].achievements[data].doneTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'You did it!'))
			: (tmp[layer].achievements[data].goalTooltip ? tmp[layer].achievements[data].goalTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'LOCKED'))
		"></tooltip>
			<br><h3 :style="tmp[layer].achievements[data].textStyle" v-html="tmp[layer].achievements[data].name"></h3><br>
		</div>
		`,
  });

  Vue.component("tree", {
    props: ["layer", "data"],
    template: `<div>
		<span class="upgRow" v-for="(row, r) in data"><table>
			<span v-for="(node, id) in row" style = "{width: 0px}">
				<tree-node :layer='node' :prev="layer" :abb="tmp[node].symbol" :key="id"></tree-node>
			</span>
			<tr><table><button class="treeNode hidden"></button></table></tr>
		</span></div>
	`,
  });

  Vue.component("upgrade-tree", {
    props: ["layer", "data"],
    template: `<thing-tree :layer="layer" :data "data" ype="upgrade"></thing-tree>`,
  });

  Vue.component("buyable-tree", {
    props: ["layer", "data"],
    template: `<thing-tree :layer="layer" :data="data" type="buyable"></thing-tree>`,
  });

  Vue.component("clickable-tree", {
    props: ["layer", "data"],
    template: `<thing-tree :layer="layer" :data="data" :type="clickable"></thing-tree>`,
  });

  Vue.component("thing-tree", {
    props: ["layer", "data", "type"],
    template: `<div>
		<span class="upgRow" v-for="(row, r) in data"><table>
			<span v-for="id in row" style = "{width: 0px; height: 0px;}" v-if="tmp[layer][type+'s'][id]!== undefined && tmp[layer][type+'s'][id].unlocked" class="upgAlign">
				<div :is="type" :layer = "layer" :data="id" :style="tmp[layer].componentStyles[type]" class="treeThing"></div>
			</span>
			<tr><table><button class="treeNode hidden"></button></table></tr>
		</span></div>
	`,
  });

  Vue.component("text-input", {
    props: ["layer", "data"],
    template: `
			<input class="instant" :id="'input-' + layer + '-' + data" :value="player[layer][data].toString()" v-on:focus="focused(true)" v-on:blur="focused(false)"
			@change="player[layer][data] = toValue(document.getElementById('input-' + layer + '-' + data).value, player[layer][data])">
		`,
  });

  Vue.component("slider", {
    props: ["layer", "data"],
    template: `
			<div class="tooltipBox">
			<tooltip :text="player[layer][data[0]]"></tooltip><input type="range" v-model="player[layer][data[0]]" :min="data[1]" :max="data[2]"></div>
		`,
  });

  Vue.component("drop-down", {
    props: ["layer", "data"],
    template: `
			<select v-model="player[layer][data[0]]">
				<option v-for="item in data[1]" :value="item">{{item}}</option>
			</select>
		`,
  });

  Vue.component("sell-one", {
    props: ["layer", "data"],
    template: `
			<button v-if="tmp[layer].buyables && tmp[layer].buyables[data].sellOne && !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)" v-on:click="run(tmp[layer].buyables[data].sellOne, tmp[layer].buyables[data])"
				v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.sellOneText ? tmp[layer].buyables.sellOneText : "Sell One"}}</button>
	`,
  });

  Vue.component("sell-all", {
    props: ["layer", "data"],
    template: `
			<button v-if="tmp[layer].buyables && tmp[layer].buyables[data].sellAll && !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false)" v-on:click="run(tmp[layer].buyables[data].sellAll, tmp[layer].buyables[data])"
				v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.sellAllText ? tmp[layer].buyables.sellAllText : "Sell All"}}</button>
	`,
  });

  Vue.component("node-mark", systemComponents["node-mark"]);
  Vue.component("tab-buttons", systemComponents["tab-buttons"]);
  Vue.component("tree-node", systemComponents["tree-node"]);
  Vue.component("layer-tab", systemComponents["layer-tab"]);
  Vue.component("overlay-head", systemComponents["overlay-head"]);
  Vue.component("info-tab", systemComponents["info-tab"]);
  Vue.component("options-tab", systemComponents["options-tab"]);
  Vue.component("tooltip", systemComponents.tooltip);
  Vue.component("particle", systemComponents.particle);
  Vue.component("bg", systemComponents.bg);

  app = new Vue({
    el: "#app",
    data: {
      player,
      tmp,
      options,
      LAYERS,
      hotkeys,
      activePopups,
      particles,
    },
  });
}
