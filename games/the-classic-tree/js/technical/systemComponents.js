var systemComponents = {
	'tab-buttons': {
		props: ['layer', 'data', 'name'],
		template: `
			<div class="upgRow">
				<div v-for="tab in Object.keys(data)">
					<button v-if="data[tab].unlocked == undefined || data[tab].unlocked" v-bind:class="{tabButton: true, notify: subtabShouldNotify(layer, name, tab), resetNotify: subtabResetNotify(layer, name, tab)}"
					v-bind:style="[{'border-color': tmp[layer].color}, (subtabShouldNotify(layer, name, tab) ? {'box-shadow': 'var(--hqProperty2a), 0 0 20px '  + (data[tab].glowColor || defaultGlow)} : {}), tmp[layer].componentStyles['tab-button'], data[tab].buttonStyle]"
						v-on:click="function(){player.subtabs[layer][name] = tab; updateTabFormats(); needCanvasUpdate = true;}">{{tab}}</button>
				</div>
			</div>
		`
	},

	'tree-node': {
		props: ['layer', 'abb', 'size', 'prev'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				if (shiftDown && options.forceTooltips) player[layer].forceTooltip = !player[layer].forceTooltip
				else if(tmp[layer].isLayer) {
					if (tmp[layer].leftTab) {
						showNavTab(layer, prev)
						showTab('none')
					}
					else
						showTab(layer, prev)
				}
				else {run(layers[layer].onClick, layers[layer])}
			}"


			v-bind:class="{
				treeNode: tmp[layer].isLayer,
				treeButton: !tmp[layer].isLayer,
				smallNode: size == 'small',
				[layer]: true,
				tooltipBox: true,
				forceTooltip: player[layer].forceTooltip,
				ghost: tmp[layer].layerShown == 'ghost',
				hidden: !tmp[layer].layerShown,
				locked: tmp[layer].isLayer ? !(player[layer].unlocked || tmp[layer].canReset) : !(tmp[layer].canClick),
				notify: tmp[layer].notify && player[layer].unlocked,
				resetNotify: tmp[layer].prestigeNotify,
				can: ((player[layer].unlocked || tmp[layer].canReset) && tmp[layer].isLayer) || (!tmp[layer].isLayer && tmp[layer].canClick),
				front: !tmp.scrolled,
			}"
			v-bind:style="constructNodeStyle(layer)">
			<span class="nodeLabel" v-html="(abb !== '' && tmp[layer].image === undefined) ? abb : '&nbsp;'"></span>
			<tooltip
      v-if="tmp[layer].tooltip != ''"
			:text="(tmp[layer].isLayer) ? (
				player[layer].unlocked ? (tmp[layer].tooltip ? tmp[layer].tooltip : formatWhole(player[layer].points) + ' ' + tmp[layer].resource)
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : 'Reach ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + ')')
			)
			: (
				tmp[layer].canClick ? (tmp[layer].tooltip ? tmp[layer].tooltip : 'I am a button!')
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : 'I am a button!')
			)"></tooltip>
			<node-mark :layer='layer' :data='tmp[layer].marked'></node-mark></span>
		</button>
		`
	},

	
	'layer-tab': {
		props: ['layer', 'back', 'spacing', 'embedded'],
		template: `<div v-bind:style="[tmp[layer].style ? tmp[layer].style : {}, (tmp[layer].tabFormat && !Array.isArray(tmp[layer].tabFormat)) ? tmp[layer].tabFormat[player.subtabs[layer].mainTabs].style : {}]" class="noBackground">
		<div v-if="back"><button v-bind:class="back == 'big' ? 'other-back' : 'back'" v-on:click="goBack(layer)">←</button></div>
		<div v-if="!tmp[layer].tabFormat">
			<div v-if="spacing" v-bind:style="{'height': spacing}" :key="this.$vnode.key + '-spacing'"></div>
			<infobox v-if="tmp[layer].infoboxes" :layer="layer" :data="Object.keys(tmp[layer].infoboxes)[0]":key="this.$vnode.key + '-info'"></infobox>
			<main-display v-bind:style="tmp[layer].componentStyles['main-display']" :layer="layer"></main-display>
			<div v-if="tmp[layer].type !== 'none'">
				<prestige-button v-bind:style="tmp[layer].componentStyles['prestige-button']" :layer="layer"></prestige-button>
			</div>
			<resource-display v-bind:style="tmp[layer].componentStyles['resource-display']" :layer="layer"></resource-display>
			<milestones v-bind:style="tmp[layer].componentStyles.milestones" :layer="layer"></milestones>
			<div v-if="Array.isArray(tmp[layer].midsection)">
				<column :layer="layer" :data="tmp[layer].midsection" :key="this.$vnode.key + '-mid'"></column>
			</div>
			<clickables v-bind:style="tmp[layer].componentStyles['clickables']" :layer="layer"></clickables>
			<buyables v-bind:style="tmp[layer].componentStyles.buyables" :layer="layer"></buyables>
			<upgrades v-bind:style="tmp[layer].componentStyles['upgrades']" :layer="layer"></upgrades>
			<challenges v-bind:style="tmp[layer].componentStyles['challenges']" :layer="layer"></challenges>
			<achievements v-bind:style="tmp[layer].componentStyles.achievements" :layer="layer"></achievements>
			<br><br>
		</div>
		<div v-if="tmp[layer].tabFormat">
			<div v-if="Array.isArray(tmp[layer].tabFormat)"><div v-if="spacing" v-bind:style="{'height': spacing}"></div>
				<column :layer="layer" :data="tmp[layer].tabFormat" :key="this.$vnode.key + '-col'"></column>
			</div>
			<div v-else>
				<div class="upgTable" v-bind:style="{'padding-top': (embedded ? '0' : '25px'), 'margin-top': (embedded ? '-10px' : '0'), 'margin-bottom': '24px'}">
					<tab-buttons v-bind:style="tmp[layer].componentStyles['tab-buttons']" :layer="layer" :data="tmp[layer].tabFormat" :name="'mainTabs'"></tab-buttons>
				</div>
				<layer-tab v-if="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer" :layer="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer" :embedded="true" :key="this.$vnode.key + '-' + layer"></layer-tab>
				<column v-else :layer="layer" :data="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].content" :key="this.$vnode.key + '-col'"></column>
			</div>
		</div></div>
			`
	},

	'overlay-head': {
		template: `			
		<div class="overlayThing" style="padding-bottom:7px; width: 90%; z-index: 1000; position: relative">
		<span v-if="player.devSpeed && player.devSpeed != 1" class="overlayThing">
			<br>Dev Speed: {{format(player.devSpeed)}}x<br>
		</span>
		<span v-if="player.offTime !== undefined"  class="overlayThing">
			<br>Offline Time: {{formatTime(player.offTime.remain)}}<br>
		</span>
		<br>
		<span v-if="player.points.lt('1e1000')"  class="overlayThing">You have </span>
		<h2  class="overlayThing" id="points" v-html="format(player.points)"></h2>
		<span v-if="player.points.lt('1e1e6')"  class="overlayThing"> {{modInfo.pointsName}}</span>
		<br>
		<span v-if="canGenPoints()"  class="overlayThing">({{tmp.other.oompsMag != 0 ? format(tmp.other.oomps) + " OOM" + (tmp.other.oompsMag < 0 ? "^OOM" : tmp.other.oompsMag > 1 ? "^" + tmp.other.oompsMag : "") + "s" : formatSmall(getPointGen())}}/sec)</span>
		<div v-for="thing in tmp.displayThings" class="overlayThing"><span v-if="thing" v-html="thing"></span></div>
	</div>
	`
    },

    'info-tab': {
        template: `
        <div>
        <h2>{{modInfo.name}}</h2>
        <br>
        <h3>{{VERSION.withName}}</h3>
        <span v-if="modInfo.author">
            <br>
            Made by {{modInfo.author}}	
        </span>
        <br>
        The Modding Tree <a v-bind:href="'https://github.com/Acamaeda/The-Modding-Tree/blob/master/changelog.md'" target="_blank" class="link" v-bind:style = "{'font-size': '14px', 'display': 'inline'}" >{{TMT_VERSION.tmtNum}}</a> by Acamaeda and FlamemasterNXF
        <br>
        The Prestige Tree made by Jacorb and Aarex
		<br><br>
		<div class="link" onclick="showTab('changelog-tab')">Changelog</div><br>
		<div class="link" onclick="showTab('savebank-tab')">Official Save Bank</div><br>
        <span v-if="modInfo.discordLink"><a class="link" v-bind:href="modInfo.discordLink" target="_blank">{{modInfo.discordName}}</a><br></span>
        <a class="link" href="https://discord.gg/F3xveHV" target="_blank" v-bind:style="modInfo.discordLink ? {'font-size': '16px'} : {}">The Modding Tree Discord</a><br>
        <a class="link" href="http://discord.gg/wwQfgPa" target="_blank" v-bind:style="{'font-size': '16px'}">Main Prestige Tree server</a><br>
		<br><br>
        Time Played: {{ formatTime(player.timePlayed) }}<br><br>
        <h3>Hotkeys</h3><br>
        <span v-for="key in hotkeys" v-if="player[key.layer].unlocked && tmp[key.layer].hotkeys[key.id].unlocked"><br>{{key.description}}</span></div>
    `
    },

    'options-tab': {
        data() { return {
            saveSlots: [],
            currentSlot: 0,
            saveBank: [],
        }},
        mounted() {
            this.refreshSaves();
        },
        methods: {
            refreshSaves() {
                try { this.saveSlots = getSaveSlots(); } catch(e) { this.saveSlots = []; }
                try { this.currentSlot = currentSaveSlot; } catch(e) { this.currentSlot = 0; }
                try { this.saveBank = getSaveBank(); } catch(e) { this.saveBank = []; }
            },
            doDeposit() {
                let name = prompt('Name this bank deposit:') || '';
                depositToBank(name);
                this.refreshSaves();
            },
            doWithdraw(id) { withdrawFromBank(id); },
            doExportBank(id) { exportBankSlot(id); },
            doDeleteBank(id) { deleteFromBank(id); this.refreshSaves(); },
            doSaveSlot(id) { saveToSlot(id); this.refreshSaves(); },
            doLoadSlot(id) { loadFromSlot(id); },
            doExportSlot(id) { exportSaveSlot(id); },
            doDeleteSlot(id) { deleteSaveSlot(id); this.refreshSaves(); },
            doNewSlot() {
                let name = prompt('Enter save name:') || ('Save ' + (this.saveSlots.length + 1));
                createSaveSlot(name);
                this.refreshSaves();
            },
            doImportSlot() {
                let slot = prompt('Import to which slot? (0-' + (this.saveSlots.length) + '):');
                if (slot !== null) importSaveSlot(parseInt(slot) || 0);
                this.refreshSaves();
            },
            fmtTime(s) { return formatSaveTime(s); },
            fmtDate(t) { return formatSaveDate(t); },
            openSaveBank() { showTab('savebank-tab'); },
        },
        template: `
        <div>
        <table>
            <tr>
                <td><button class="opt" onclick="save()">Save</button></td>
                <td><button class="opt" onclick="toggleOpt('autosave')">Autosave: {{ options.autosave?"ON":"OFF" }}</button></td>
                <td><button class="opt" onclick="hardReset()">HARD RESET</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="exportSave()">Export to clipboard</button></td>
                <td><button class="opt" onclick="importSave()">Import</button></td>
                <td><button class="opt" onclick="toggleOpt('offlineProd')">Offline Prod: {{ options.offlineProd?"ON":"OFF" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="switchTheme()">Theme: {{ getThemeName() }}</button></td>
                <td><button class="opt" onclick="adjustMSDisp()">Show Milestones: {{ MS_DISPLAYS[MS_SETTINGS.indexOf(options.msDisplay)]}}</button></td>
                <td><button class="opt" onclick="toggleOpt('hqTree')">High-Quality Tree: {{ options.hqTree?"ON":"OFF" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="toggleOpt('hideChallenges')">Completed Challenges: {{ options.hideChallenges?"HIDDEN":"SHOWN" }}</button></td>
                <td><button class="opt" onclick="toggleOpt('forceOneTab'); needsCanvasUpdate = true">Single-Tab Mode: {{ options.forceOneTab?"ALWAYS":"AUTO" }}</button></td>
                <td><button class="opt" onclick="toggleOpt('forceTooltips'); needsCanvasUpdate = true">Shift-Click to Toggle Tooltips: {{ options.forceTooltips?"ON":"OFF" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="toggleOpt('hideMilestonePopups')">Show Milestone Popups: {{ formatOption(!options.hideMilestonePopups) }}</button></td>
                <td><select class="opt" style="font-size: 11px; min-width: 180px;" onchange="setNotationFromDropdown(this.value)">
                    <option v-for="n in getNotationOptions()" :key="n.id" :value="n.id" :selected="n.id === options.notation">{{ n.name }}</option>
                </select></td>
                <td><span style="font-size: 10px">Eternal Notations by<br><a href="https://github.com/MathCookie17/Eternal-Notations" target="_blank" class="link">MathCookie17</a> (146 presets)</span></td>
            </tr>
            <tr>
                <td><select class="opt" style="font-size: 11px; min-width: 180px;" onchange="setFontFromDropdown(this.value)">
                    <option v-for="f in getFontOptions()" :key="f.id" :value="f.id" :selected="f.id === options.font">{{ f.name }}</option>
                </select></td>
                <td><span style="font-size: 11px">UI Font<br><small>restyles the whole tree</small></span></td>
                <td><button class="opt" onclick="setFontFromDropdown('orbitron')">Reset Font</button></td>
            </tr>
        </table>
        <br>
        <h3 style="color: #FFD700;">💾 Save Slots</h3>
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #444; border-radius: 8px; background: rgba(0,0,0,0.2);">
            <table style="width: 100%; border-collapse: collapse;">
                <tr v-for="slot in saveSlots" :key="slot.id" style="border-bottom: 1px solid #333;">
                    <td style="padding: 6px; text-align: left;">
                        <b :style="{'color': slot.id === currentSlot ? '#4BDC13' : '#fff'}">{{ slot.name }}</b>
                        <br><small style="color: #888;">{{ slot.points }} pts | {{ fmtTime(slot.timePlayed) }} | {{ fmtDate(slot.lastSaved) }}</small>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 55px; font-size: 10px; border-radius: 6px;" 
                            :style="{'background-color': slot.id === currentSlot ? '#4BDC13' : '#555'}"
                            @click="doSaveSlot(slot.id)">
                            {{ slot.id === currentSlot ? '✓ Active' : 'Save' }}
                        </button>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 50px; font-size: 10px; border-radius: 6px; background-color: #4488ff;" 
                            @click="doLoadSlot(slot.id)">
                            Load
                        </button>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 55px; font-size: 10px; border-radius: 6px;" 
                            @click="doExportSlot(slot.id)">
                            Export
                        </button>
                    </td>
                    <td style="padding: 4px;" v-if="slot.id !== 0">
                        <button class="opt" style="height: 28px; width: 28px; font-size: 10px; border-radius: 6px; background-color: #cc3333;" 
                            @click="doDeleteSlot(slot.id)">
                            ✕
                        </button>
                    </td>
                </tr>
            </table>
            <div style="margin-top: 10px;">
                <button class="opt" style="height: 32px; width: 120px; font-size: 11px; border-radius: 6px; background-color: #4BDC13;" 
                    @click="doNewSlot()">
                    + New Slot
                </button>
                <button class="opt" style="height: 32px; width: 120px; font-size: 11px; border-radius: 6px; margin-left: 8px; background-color: #ff8800;" 
                    @click="doImportSlot()">
                    Import to Slot
                </button>
            </div>
        </div>
        <br>
        <h3 style="color: #FFD700;">🏦 Save Bank</h3>
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #444; border-radius: 8px; background: rgba(0,0,0,0.2);">
            <button class="opt" style="height: 35px; width: 200px; font-size: 12px; border-radius: 6px; background-color: #FFD700; color: #000; font-weight: bold;" 
                @click="doDeposit()">
                💰 Deposit Current Game
            </button>
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;" v-if="saveBank.length > 0">
                <tr v-for="entry in saveBank" :key="entry.id" style="border-bottom: 1px solid #333;">
                    <td style="padding: 6px; text-align: left;">
                        <b style="color: #FFD700;">{{ entry.name }}</b>
                        <br><small style="color: #888;">{{ entry.points }} pts | {{ entry.achievements }} achievements | {{ fmtDate(entry.deposited) }}</small>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 65px; font-size: 10px; border-radius: 6px; background-color: #4BDC13;" 
                            @click="doWithdraw(entry.id)">
                            Withdraw
                        </button>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 55px; font-size: 10px; border-radius: 6px;" 
                            @click="doExportBank(entry.id)">
                            Export
                        </button>
                    </td>
                    <td style="padding: 4px;">
                        <button class="opt" style="height: 28px; width: 28px; font-size: 10px; border-radius: 6px; background-color: #cc3333;" 
                            @click="doDeleteBank(entry.id)">
                            ✕
                        </button>
                    </td>
                </tr>
            </table>
            <div v-else style="margin-top: 10px; color: #666; font-style: italic;">
                No saves in bank yet. Click "Deposit Current Game" to create a backup!
            </div>
        </div>
        </div>
        `
    },

    'back-button': {
        template: `
        <button v-bind:class="back" onclick="goBack()">←</button>
        `
    },


	'tooltip' : {
		props: ['text'],
		template: `<div class="tooltip" v-html="text"></div>
		`
	},

	'node-mark': {
		props: {'layer': {}, data: {}, offset: {default: 0}, scale: {default: 1}},
		template: `<div v-if='data'>
			<div v-if='data === true' class='star' v-bind:style='{position: "absolute", left: (offset-10) + "px", top: (offset-10) + "px", transform: "scale( " + scale||1 + ", " + scale||1 + ")"}'></div>
			<img v-else class='mark' v-bind:style='{position: "absolute", left: (offset-22) + "px", top: (offset-15) + "px", transform: "scale( " + scale||1 + ", " + scale||1 + ")"}' v-bind:src="data"></div>
		</div>
		`
	},

	'particle': {
		props: ['data', 'index'],
		template: `<div><div class='particle instant' v-bind:style="[constructParticleStyle(data), data.style]" 
			v-on:click="run(data.onClick, data)"  v-on:mouseenter="run(data.onMouseEnter, data)" v-on:mouseleave="run(data.onMouseLeave, data)" ><span v-html="data.text"></span>
		</div>
		<svg version="2" v-if="data.color">
		<mask v-bind:id="'pmask' + data.id">
        <image id="img" v-bind:href="data.image" x="0" y="0" :height="data.width" :width="data.height" />
    	</mask>
    	</svg>
		</div>
		`
	},

	'bg': {
		props: ['layer'],
		template: `<div class ="bg" v-bind:style="[tmp[layer].style ? tmp[layer].style : {}, (tmp[layer].tabFormat && !Array.isArray(tmp[layer].tabFormat)) ? tmp[layer].tabFormat[player.subtabs[layer].mainTabs].style : {}]"></div>
		`
	}

}

