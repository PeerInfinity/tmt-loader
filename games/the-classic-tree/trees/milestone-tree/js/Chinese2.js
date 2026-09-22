
/*

 @name    : 锅巴汉化 - Web汉化插件
 @author  : 麦子、JAR、小蓝、好阳光的小锅巴
 @version : V0.6.1 - 2019-07-09
 @website : http://www.g8hh.com

*/

//1.汉化杂项
var cnItems = {
    _OTHER_: [],
	
    'You have': '你有',
    'You have ': '你有',
    'points': '点数',
    ' points': '点数',
    'Milestone Gotten!': '获得里程碑！',
	
    'Start': '开始',
    'Exit Early': '提前退出',
    'Completed': '已完成',
    'Finish': '完成挑战',
	
    'HARD RESET': '硬复位',
    'ON': '开启',
    'OFF': '关闭',
    'Save': '保存',
    'Export to clipboard': '导出到剪贴板',
    'Export': '导出',
    'Import': '导入',
    'You have': '你有',
    'ALWAYS': '一直',
    'default': '默认',
    'aqua': '水色',
    'SHOWN': '显示',
    'HIDDEN': '隐藏',
    'ALL': '全部',
    'LAST, INCOMPLETE': '最后一个及未获得',
    'INCOMPLETE': '未获得',
    'OFF': '关闭',
    'NONE': '不显示',
    'Changelog': '更新日志',
    'Single-Tab Mode: AUTO': '单标签页模式：自动',
    'Single-Tab Mode: ALWAYS': '单标签页模式：总是启用',
	
	'Hotkeys': '热键',
	'M: Get Milestone': 'M：获得里程碑',
	'P: Reset for prestige points': 'P：重置以获得声望点数',
	'S: Reset for super-prestige points': 'S：重置以获得超级声望点数',
	'Shift+M: Get Meta-Milestone': 'Shift+M：获得元里程碑',
	'B: Reset for prestige boosts': 'B：重置以获得声望加成',
	'H: Reset for hyper-prestige points': 'H：重置以获得第三级声望点数',
	'A: Reset for atomic-prestige points': 'A：重置以获得原子级声望点数',
	'T: Reset for transcend points': 'T：重置以获得超越点数',
	'Shift+B: Reset for hyper boosts': 'Shift+B：重置以获得超级加成',
	'E: Collect Prestige Energy': 'E：收集声望能量',
	'Shift+E: Collect Super Energy': 'Shift+E：收集超级能量',
	'Ctrl+M: Get Extra-Milestone': 'Ctrl+M：获得额外里程碑',
	'Ctrl+E: Collect Hyper Energy': 'Shift+E：收集终极能量',
	
	'Main': '主要',
	'Challenges': '挑战',
	'Special Transcend Points': '超越挑战点数',
	
	'Afdian.net Donation': '用爱发电（捐赠）',
	'Donate': '捐赠',
	'Input Supporter Code To Gain Bonuses!': '输入捐赠码获取加成！捐赠码可以通过爱发电捐赠后联系我获取哦！',
	'Buy me a coffee in Ko-Fi.com': '',
	'Patreon Donation': '',
    //原样
    '': '',
    '': '',

}


//需处理的前缀
var cnPrefix = {
    "Autosave: ": "自动保存：",
    "Offline Prod: ": "离线生产：",
    "Offline Time": "离线时间",
    "Theme: ": "主题：",
    "Show Milestones: ": "显示里程碑：",
    "Completed Challenges: ": "完成的挑战：",
    "High-Quality Tree: ": "高画质的树：",
    "Shift-Click to Toggle Tooltips: ": "Shift+点击以切换工具提示：",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需处理的后缀
var cnPostfix = {
}

//需排除的，正则匹配
var cnExcludeWhole = [
    /^x?\d+(\.\d+)?[A-Za-z%]{0,2}(\s.C)?\s*$/, //12.34K,23.4 °C
    /^x?\d+(\.\d+)?(e[+\-]?\d+)?\s*$/, //12.34e+4
    /^\s*$/, //纯空格
    /^\d+(\.\d+)?[A-Za-z]{0,2}.?\(?([+\-]?(\d+(\.\d+)?[A-Za-z]{0,2})?)?$/, //12.34M (+34.34K
    /^(\d+(\.\d+)?[A-Za-z]{0,2}\/s)?.?\(?([+\-]?\d+(\.\d+)?[A-Za-z]{0,2})?\/s\stot$/, //2.74M/s (112.4K/s tot
    /^\d+(\.\d+)?(e[+\-]?\d+)?.?\(?([+\-]?(\d+(\.\d+)?(e[+\-]?\d+)?)?)?$/, //2.177e+6 (+4.01+4
    /^(\d+(\.\d+)?(e[+\-]?\d+)?\/s)?.?\(?([+\-]?(\d+(\.\d+)?(e[+\-]?\d+)?)?)?\/s\stot$/, //2.177e+6/s (+4.01+4/s tot
];
var cnExcludePostfix = [
    /:?\s*x?\d+(\.\d+)?(e[+\-]?\d+)?\s*$/, //12.34e+4
    /:?\s*x?\d+(\.\d+)?[A-Za-z]{0,2}$/, //: 12.34K, x1.5
]

//正则替换，带数字的固定格式句子
//纯数字：(\d+)
//逗号：([\d\.,]+)
//小数点：([\d\.]+)
//原样输出的字段：(.+)
var cnRegReplace = new Map([
	[/You have (.+)/, '你有 $1'],
	[/Req:(.+)\/ Infinity(.+)/, '需要：$1/ 无限$2'],
	[/Req:(.+)/, '需要：$1'],
	[/Next at Infinity(.+)/, '下一个需要 无限$1'],
	[/Next at(.+)/, '下一个需要$1'],
	[/(.+)\/ Infinity(.+)/, '$1/ 无限$2'],
	[/You are gaining(.+)per second/, '你正在获得$1每秒'],
	[/\((.+)\/sec\)/, '($1/秒)'],
	[/Cost: Infinity(.+)/, '花费：无限$1'],
	[/Cost:(.+)/, '花费：$1'],
	[/Currently:(.+)/, '当前：$1'],
	[/Reward:(.+)/, '奖励：$1'],
	[/Goal:(.+)/, '目标：$1'],
	[/Time Played:(.+)/, '游戏时间：$1'],
]);