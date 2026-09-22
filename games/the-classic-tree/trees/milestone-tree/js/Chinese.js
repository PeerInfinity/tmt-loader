modInfo.name="里程碑之树";
VERSION.name="";
VERSION.cnum="0";
VERSION.withoutName="v"+VERSION.num+"c"+VERSION.cnum;
VERSION.withName="v"+VERSION.num+"c"+VERSION.cnum+"（中文版）";

displayThings = [
	"本MOD的作者：loader3229，QQ：1010903229",
	function(){
		if(getPointGen().gte(getPointSoftcapStart().sqrt())){
			return "因为软上限，第一个里程碑的效果变为原来的"+format(getPointGen().log(getPointGenBeforeSoftcap()),4)+"次方。<br>第一个里程碑的软上限在"+format(getPointSoftcapStart())+"开始。";
		}
		return "";
	},
	function(){
		if(player.m.effective.gte(190)&&player.r.stage==0){
		return "系统检测到里程碑之树已经不稳定，正在尝试修复中... 此期间里程碑的需求将会上升。";
		}
		return "";
	},
]

changelog = `<h1>更新日志：</h1><br>
	<h3>v1.263 - 2024/6/8</h3><br>
		- 增加了18个里程碑<br>
		- 增加了1个转世挑战<br>
		- Added a Multiverse Prestige Challenge<br>
	<h3>v1.245: 平行多宇宙 - 2024/6/5</h3><br>
		- 增加了18个里程碑<br>
		- Ported Exotic Prestige from Seder's NG+<br>
		- Ported Multiverse Prestige from Seder's NG+<br>
	<h3>v1.227: 平行宇宙 - 2024/6/4</h3><br>
		- 增加了7个里程碑<br>
		- 增加了1个原子级声望可购买项<br>
		- 增加了1个超越可购买项<br>
		- Ported Prestige Power from Seder's NG+<br>
	<h3>v1.220 - 2024/6/3</h3><br>
		- 增加了9个里程碑<br>
		- 增加了2个超级加成升级<br>
	<h3>v1.211 - 2024/6/2</h3><br>
		- 增加了1个里程碑<br>
		- 增加了1个转世可购买项<br>
		- 重新平衡200里程碑之前的游戏内容<br>
	<h3>v1.210 - 2024/5/28</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了1个原子升级<br>
	<h3>v1.205 - 2024/5/28</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了3个转世可购买项<br>
	<h3>v1.200: 大重置 - 2024/5/27</h3><br>
		- 增加了10个里程碑<br>
		- 增加了转世...<br>
		- 因为不稳定性，无法获取完整更新日志。<br>
	<h3>v1.190: 不稳定升级 - 2024/5/25</h3><br>
		- 增加了10个里程碑<br>
		- 增加了1个元里程碑<br>
		- 增加了1个额外里程碑...<br>
		- 因为不稳定性，无法获取完整更新日志。<br>
	<h3>v1.180 - 2024/5/21</h3><br>
		- 增加了10个里程碑<br>
		- 增加了1个元里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了2个终极能量升级<br>
		- 增加了1个超越挑战<br>
		- 增加了原子<br>
	<h3>v1.170 - 2024/5/20</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个元里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了1个第三级声望升级<br>
		- 增加了1个超越升级<br>
	<h3>v1.165 - 2024/5/20</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了1个第三级声望升级<br>
		- 增加了1个超级能量升级<br>
		- 增加了1个超越升级<br>
	<h3>v1.160 - 2024/2/2</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个元里程碑<br>
	- 增加了1个声望可重复购买<br>
		- 增加了1个第三级声望升级<br>
		- 增加了1个超级能量升级<br>
		- 增加了1个终极能量升级<br>
		- 增加了1个超越升级<br>
		- 增加了1个超越挑战<br>
	<h3>v1.155 - 2024/2/1</h3><br>
		- 增加了5个里程碑<br>
		- 增加了1个元里程碑<br>
		- 增加了1个额外里程碑<br>
		- 增加了1个超级能量升级<br>
		- 增加了1个层级，带有1个升级<br>
	<h3>v1.150.1 - 2024/1/29</h3><br>
		- 模组树版本更新至2.6.6.2<br>`;

winText="你暂时已经达到了这个树MOD的残局，但是现在...";

layers.m.resource="里程碑";
layers.m.effectDescription="";
layers.m.baseResource="点数";
layers.m.resetDescription="获得";

let i=0;
while(layers.m.milestones[i]){
	layers.m.milestones[i].requirementDescription="第"+(i+1)+"个里程碑";
	i++;
}

layers.m.milestones[1-1].effectDescription=function(){
	if(player.um.points.gte(1))return "获得"+format(new Decimal(1).max(getPointGen()))+"点数每秒，并且这个里程碑软上限变得更迟开始。（已升级）";
	return "获得"+format(new Decimal(1).max(getPointGen()))+"点数每秒。";
}
layers.m.milestones[2-1].effectDescription=function(){
	if(player.um.points.gte(2))return "第一个里程碑的效果变为原来的三倍，并且效果变为原来的1.01次方。（已升级）";
	return "第一个里程碑的效果变为原来的三倍。";
}
layers.m.milestones[3-1].effectDescription=function(){
	let ret="基于你的点数，第一个里程碑的效果变得更好。当前："+format(tmp.m.milestone3Effect)+"x";
	if(player.um.points.gte(3))return ret+"（已升级）";return ret;
}
layers.m.milestones[4-1].effectDescription=function(){
	let ret="基于你的总里程碑数量，第三个里程碑的效果变得更好。当前：第三个里程碑的基础效果基数 +"+format(tmp.m.milestone4Effect);
	if(player.um.points.gte(4))return ret+"（已升级）";return ret;
}
layers.m.milestones[5-1].effectDescription=function(){
	if(player.um.points.gte(5))return "解锁声望，并且声望点数变为原来的1.01次方。（已升级）";
	return "解锁下一个层级。里程碑不会被重置。";
}
layers.m.milestones[6-1].effectDescription=function(){
	let ret="基于你的总里程碑数量，声望点数的获得变得更好。当前："+format(tmp.m.milestone6Effect)+"x";
	if(player.um.points.gte(6))return ret+"（已升级）";return ret;
}
layers.m.milestones[7-1].effectDescription=function(){
	if(player.um.points.gte(7))return "第六个里程碑的效果变为原来的平方。（已升级）";
	return "第六个里程碑的效果变为原来的1.5次方。";
}
layers.m.milestones[8-1].effectDescription=function(){
	if(player.um.points.gte(8))return "第六个里程碑的效果变为原来的平方。（已升级）";
	return "第六个里程碑的效果变为原来的1.2次方。";
}
layers.m.milestones[9-1].effectDescription=function(){
	if(player.um.points.gte(9))return "第六个里程碑的效果变为原来的平方。（已升级）";
	return "第六个里程碑的效果变为原来的1.1次方。";
}
layers.m.milestones[10-1].effectDescription=function(){
	if(player.um.points.gte(10))return "解锁2个新的声望升级，并且声望升级11和12的效果变得更好。（已升级）";
	return "解锁2个新的声望升级。";
}
layers.m.milestones[11-1].effectDescription=layers.m.milestones[12-1].effectDescription=layers.m.milestones[13-1].effectDescription=layers.m.milestones[14-1].effectDescription=function(){
	let ret="声望升级"+(parseInt(this.id)+1)+"的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[15-1].effectDescription=function(){
	if(player.um.points.gte(15))return "解锁2个新的声望升级，并且声望升级13和14的效果变得更好。（已升级）";
	return "解锁2个新的声望升级。";
}
layers.m.milestones[16-1].effectDescription=layers.m.milestones[17-1].effectDescription=layers.m.milestones[18-1].effectDescription=layers.m.milestones[19-1].effectDescription=layers.m.milestones[36-1].effectDescription=layers.m.milestones[37-1].effectDescription=layers.m.milestones[38-1].effectDescription=layers.m.milestones[39-1].effectDescription=function(){
	if(player.um.points.gte(parseInt(this.id)+1))return "第三个里程碑的效果变为原来的1.05次方。（已升级）";
	return "第三个里程碑的效果变为原来的1.0"+(parseInt(this.id)+1)+"次方。";
}
layers.m.milestones[20-1].effectDescription=function(){
	if(player.um.points.gte(20))return "每秒获得重置可以获得的声望点数的1e22%。（已升级）";
	if(player.m.effective.gte(135))return "每秒获得重置可以获得的声望点数的1e12%。";
	return "每秒获得重置可以获得的声望点数的10000%。";
}
layers.m.milestones[21-1].effectDescription=function(){
	if(player.um.points.gte(21))return "解锁2个新的声望升级，并且声望升级21和22的效果变得更好。（已升级）";
	return "解锁2个新的声望升级。";
}
layers.m.milestones[22-1].effectDescription=function(){
	if(player.um.points.gte(22))return "声望点数的获得乘以100，并且变为原来的1.01次方。（已升级）";
	return "声望点数的获得乘以22。";
}
layers.m.milestones[23-1].effectDescription=function(){
	let ret="声望升级23的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[24-1].effectDescription=function(){
	let ret="声望升级24的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[25-1].effectDescription=function(){
	if(player.um.points.gte(25))return "解锁超级声望，并且超级声望点数变为原来的1.02次方。（已升级）";
	return "解锁下一个层级。";
}
layers.m.milestones[26-1].effectDescription=function(){
	if(player.um.points.gte(26))return "在超级声望时保留声望升级和购买项。（已升级）";
	return "在超级声望时保留声望升级。";
}
layers.m.milestones[27-1].effectDescription=function(){
	let ret="基于你的总里程碑数量，超级声望点数的获得变得更好。当前："+format(tmp.m.milestone27Effect)+"x";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[28-1].effectDescription=function(){
	if(player.um.points.gte(28))return "第27个里程碑的效果变为原来的平方。（已升级）";
	return "第27个里程碑的效果变为原来的1.5次方。";
}
layers.m.milestones[29-1].effectDescription=function(){
	if(player.um.points.gte(29))return "第27个里程碑的效果变为原来的平方。（已升级）";
	return "第27个里程碑的效果变为原来的1.2次方。";
}
layers.m.milestones[30-1].effectDescription=function(){
	if(player.um.points.gte(30))return "解锁2个新的超级声望升级，并且超级声望升级11和12的效果变得更好。（已升级）";
	return "解锁2个新的超级声望升级。";
}
layers.m.milestones[31-1].effectDescription=layers.m.milestones[32-1].effectDescription=layers.m.milestones[33-1].effectDescription=layers.m.milestones[34-1].effectDescription=function(){
	let ret="声望升级和超级声望升级"+(parseInt(this.id)-19)+"的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[35-1].effectDescription=function(){
	if(player.um.points.gte(35))return "解锁2个新的超级声望升级，并且第六个里程碑的效果变为原来的5次方。（已升级）";
	return "解锁2个新的超级声望升级。第六个里程碑的效果变为原来的3.5次方。";
}
layers.m.milestones[40-1].effectDescription=function(){
	if(player.um.points.gte(40))return "解锁2个新的超级声望升级。解锁元里程碑并且您可以升级它们。（已升级）";
	return "解锁下一个层级。解锁2个新的超级声望升级。";
}
layers.m.milestones[41-1].effectDescription=function(){
	if(player.um.points.gte(41))return "第三个里程碑的基础效果指数变为原来的1.005次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.003次方。";
}
layers.m.milestones[42-1].effectDescription=function(){
	if(player.um.points.gte(42))return "第六个里程碑的效果变为原来的(里程碑升级数量+元里程碑数量)次方。（已升级）";
	return "第六个里程碑的效果变为原来的(1+元里程碑数量)次方。";
}
layers.m.milestones[43-1].effectDescription=layers.m.milestones[48-1].effectDescription=layers.m.milestones[53-1].effectDescription=layers.m.milestones[58-1].effectDescription=layers.m.milestones[63-1].effectDescription=layers.m.milestones[68-1].effectDescription=layers.m.milestones[73-1].effectDescription=layers.m.milestones[78-1].effectDescription=layers.m.milestones[88-1].effectDescription=layers.m.milestones[93-1].effectDescription=layers.m.milestones[98-1].effectDescription=function(){
	let ret="第四个里程碑的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[44-1].effectDescription=layers.m.milestones[54-1].effectDescription=layers.m.milestones[64-1].effectDescription=layers.m.milestones[74-1].effectDescription=function(){
	let ret="第一行声望升级的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[45-1].effectDescription=function(){
	if(player.um.points.gte(45))return "解锁4个新的声望升级，并且这4个升级效果变得更好。（已升级）";
	return "解锁4个新的声望升级。";
}
layers.m.milestones[46-1].effectDescription=function(){
	if(player.um.points.gte(46))return "第三个里程碑的基础效果指数变为原来的1.005次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.001次方。";
}
layers.m.milestones[47-1].effectDescription=function(){
	if(player.um.points.gte(47))return "第27个里程碑的效果变为原来的(元里程碑数量的0.5次方)次方。（已升级）";
	return "第27个里程碑的效果变为原来的(1+元里程碑数量的0.25次方)次方。";
}
layers.m.milestones[49-1].effectDescription=layers.m.milestones[59-1].effectDescription=function(){
	let ret="第一行超级声望升级的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[50-1].effectDescription=function(){
	if(player.um.points.gte(50)&&player.r.stage>=1)return "解锁声望加成，并且声望加成变得更好。（已升级）";
	if(player.um.points.gte(50))return "解锁声望加成。这个里程碑的升级效果已经失效，除非您完成了一次第7行重置。（已升级）";
	return "解锁下一个层级。";
}
layers.m.milestones[51-1].effectDescription=function(){
	if(player.um.points.gte(51))return "第三个里程碑的基础效果指数变为原来的1.005次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.00175次方。";
}
layers.m.milestones[52-1].effectDescription=function(){
	if(player.um.points.gte(52))return "第六个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第六个里程碑的效果变为原来的(1+元里程碑数量的0.1次方)次方。";
}
layers.m.milestones[55-1].effectDescription=function(){
	if(player.um.points.gte(55))return "解锁4个新的超级声望升级，并且这4个升级效果变得更好。（已升级）";
	return "解锁4个新的超级声望升级。";
}
layers.m.milestones[56-1].effectDescription=function(){
	if(player.um.points.gte(56))return "第三个里程碑的基础效果指数变为原来的1.002次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.00078次方。";
}
layers.m.milestones[57-1].effectDescription=function(){
	if(player.um.points.gte(57))return "每秒获得重置可以获得的超级声望点数的1e22%。（已升级）";
	if(player.m.effective.gte(135))return "每秒获得重置可以获得的超级声望点数的1e12%。";
	return "每秒获得重置可以获得的超级声望点数的100%。";
}
layers.m.milestones[60-1].effectDescription=function(){
	if(player.um.points.gte(60))return "解锁第三级声望，并且第三级声望点数变为原来的1.03次方。声望加成不重置任何东西，并且自动获取声望加成。（已升级）";
	return "解锁下一个层级。声望加成不重置任何东西，并且自动获取声望加成。";
}
layers.m.milestones[61-1].effectDescription=layers.m.milestones[66-1].effectDescription=function(){
	if(player.um.points.gte(parseInt(this.id)+1))return "第三个里程碑的基础效果指数变为原来的1.002次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.0005次方。";
}
layers.m.milestones[62-1].effectDescription=function(){
	if(player.um.points.gte(62))return "第六个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第六个里程碑的效果变为原来的(元里程碑数量的0.129次方)次方。";
}
layers.m.milestones[65-1].effectDescription=function(){
	if(player.um.points.gte(65))return "在第三级声望时保留声望升级和购买项、超级声望升级和购买项。解锁2个新的第三级声望升级。第一行第三级声望升级的效果变得更好。（已升级）";
	return "在第三级声望时保留声望升级和超级声望升级。解锁2个新的第三级声望升级。";
}
layers.m.milestones[67-1].effectDescription=function(){
	if(player.um.points.gte(67))return "第27个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第27个里程碑的效果变为原来的(元里程碑数量的0.147次方)次方。";
}
layers.m.milestones[69-1].effectDescription=layers.m.milestones[79-1].effectDescription=layers.m.milestones[89-1].effectDescription=function(){
	let ret="第一行超级声望升级和第一行第三级声望升级的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[70-1].effectDescription=function(){
	if(player.um.points.gte(70))return "在第三级声望时保留声望加成升级。解锁4个新的第三级声望升级并且这些升级变得更好。（已升级）";
	return "在第三级声望时保留声望加成升级。解锁4个新的第三级声望升级。";
}
layers.m.milestones[71-1].effectDescription=function(){
	if(player.um.points.gte(71))return "第三个里程碑的基础效果指数变为原来的1.002次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.001236次方。";
}
layers.m.milestones[72-1].effectDescription=function(){
	if(player.um.points.gte(72))return "第六个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第六个里程碑的效果变为原来的(元里程碑数量的0.1次方)次方。";
}
layers.m.milestones[75-1].effectDescription=function(){
	if(player.um.points.gte(75))return "每秒获得重置可以获得的第三级声望点数的1e22%。（已升级）";
	if(player.m.effective.gte(135))return "每秒获得重置可以获得的第三级声望点数的1e12%。";
	return "每秒获得重置可以获得的第三级声望点数的10000%。";
}
layers.m.milestones[76-1].effectDescription=function(){
	if(player.um.points.gte(76))return "第三个里程碑的基础效果指数变为原来的1.002次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.00157次方。";
}
layers.m.milestones[77-1].effectDescription=function(){
	if(player.um.points.gte(77))return "解锁一个超级声望可重复购买项，并且这个购买项变得更便宜。（已升级）";
	return "解锁一个超级声望可重复购买项。";
}
layers.m.milestones[80-1].effectDescription=function(){
	if(player.um.points.gte(80))return "解锁原子级声望，并且原子级声望点数变为原来的1.04次方。（已升级）";
	return "解锁下一个层级。";
}
layers.m.milestones[81-1].effectDescription=function(){
	if(player.um.points.gte(81))return "第三个里程碑的基础效果指数变为原来的1.001次方。在原子级声望时保留声望升级和购买项、超级声望升级和购买项、声望加成升级和购买项。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.0005次方。在原子级声望时保留声望升级、超级声望升级和声望加成升级。";
}
layers.m.milestones[82-1].effectDescription=function(){
	if(player.um.points.gte(82))return "第六个里程碑的效果变为原来的(元里程碑数量)次方。在原子级声望时保留第三级声望升级和购买项。（已升级）";
	return "第六个里程碑的效果变为原来的(元里程碑数量的0.2次方)次方。在原子级声望时保留第三级声望升级。";
}
layers.m.milestones[83-1].effectDescription=function(){
	let ret="第四个里程碑的效果变得更好。自动购买第一个超级声望可重复购买项。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[84-1].effectDescription=layers.m.milestones[94-1].effectDescription=function(){
	let ret="第一行声望升级和第一行原子级声望升级的效果变得更好。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[85-1].effectDescription=function(){
	if(player.um.points.gte(85))return "解锁一个第三级声望可重复购买项，并且这个购买项变得更便宜。解锁4个新的第三级声望升级。（已升级）";
	return "解锁一个第三级声望可重复购买项。解锁4个新的第三级声望升级。";
}
layers.m.milestones[86-1].effectDescription=layers.m.milestones[91-1].effectDescription=layers.m.milestones[96-1].effectDescription=function(){
	if(player.um.points.gte(parseInt(this.id)+1))return "第三个里程碑的基础效果指数变为原来的1.001次方。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.0005次方。";
}
layers.m.milestones[87-1].effectDescription=function(){
	if(player.um.points.gte(87))return "第27个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第27个里程碑的效果变为原来的(元里程碑数量的0.3次方)次方。";
}
layers.m.milestones[90-1].effectDescription=function(){
	if(player.um.points.gte(90))return "每秒获得重置可以获得的原子级声望点数的1e22%。（已升级）";
	if(player.m.effective.gte(135))return "每秒获得重置可以获得的原子级声望点数的1e12%。";
	return "每秒获得重置可以获得的原子级声望点数的500%。";
}
layers.m.milestones[92-1].effectDescription=function(){
	if(player.um.points.gte(92))return "第六个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第六个里程碑的效果变为原来的(元里程碑数量的0.3次方)次方。";
}
layers.m.milestones[95-1].effectDescription=function(){
	if(player.um.points.gte(95))return "解锁一个原子级挑战，并且减少这个挑战的目标。自动购买第一个第三级声望可重复购买项。（已升级）";
	return "解锁一个原子级挑战。自动购买第一个第三级声望可重复购买项。";
}
layers.m.milestones[97-1].effectDescription=function(){
	if(player.um.points.gte(97))return "第27个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第27个里程碑的效果变为原来的(元里程碑数量的0.4次方)次方。";
}
layers.m.milestones[99-1].effectDescription=function(){
	if(player.um.points.gte(99))return "解锁超越，并且超越点数的获得变得更好。（已升级）";
	return "解锁下一个层级。";
}
layers.m.milestones[100-1].effectDescription=function(){
	if(player.um.points.gte(100))return "在超越时保留声望升级和超级声望升级和购买项。（已升级）";
	return "在超越时保留声望升级和超级声望升级。";
}
layers.m.milestones[101-1].effectDescription=function(){
	if(player.um.points.gte(101))return "在超越时保留第三级声望升级和声望加成升级和购买项。（已升级）";
	return "在超越时保留第三级声望升级和声望加成升级。";
}
layers.m.milestones[102-1].effectDescription=function(){
	if(player.um.points.gte(102))return "在超越时保留原子级声望升级和购买项。（已升级）";
	return "在超越时保留原子级声望升级。";
}
layers.m.milestones[103-1].effectDescription=function(){
	if(player.um.points.gte(103))return "所有原子级挑战的完成次数永远不小于3，即使你在超越或转世挑战里面。（已升级）";
	return "在超越时自动完成原子级挑战1-5各3次，除非你在一个超越挑战里面。";
}
layers.m.milestones[104-1].effectDescription=function(){
	if(player.um.points.gte(104))return "第四个里程碑的效果变得更好。解锁超级加成，并且超级加成变得更便宜。解锁4个新的超越升级。解锁一个第三级声望可重复购买项。解锁一个超越挑战。（已升级）";
	return "第四个里程碑的效果变得更好。解锁一个层级。解锁4个新的超越升级。解锁一个第三级声望可重复购买项。解锁一个超越挑战。";
}
layers.m.milestones[105-1].effectDescription=function(){
	let ret="基于你的总里程碑数量，第一个里程碑的软上限开始得更迟。当前："+format(tmp.m.milestone105Effect)+"x";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[106-1].effectDescription=function(){
	if(player.um.points.gte(106))return "第6个和第27个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	return "第6个和第27个里程碑的效果变为原来的(元里程碑数量的0.5次方)次方。";
}
layers.m.milestones[107-1].effectDescription=function(){
	if(player.um.points.gte(107))return "第三个里程碑的基础效果指数变为原来的1.00284次方。自动购买第二个第三级声望可重复购买项。（已升级）";
	return "第三个里程碑的基础效果指数变为原来的1.002次方。自动购买第二个第三级声望可重复购买项。";
}
layers.m.milestones[108-1].effectDescription=function(){
	if(player.um.points.gte(108))return "所有原子级挑战的完成次数永远不小于6，即使你在超越或转世挑战里面。（已升级）";
	return "在超越时自动完成原子级挑战1-5各6次，除非你在一个超越挑战里面。";
}
layers.m.milestones[109-1].effectDescription=function(){
	let ret="第四个里程碑的效果变得更好。解锁一个超越挑战。";
	if(player.um.points.gte(parseInt(this.id)+1))return ret+"（已升级）";return ret;
}
layers.m.milestones[110-1].effectDescription=function(){
	if(player.um.points.gte(110))return "减少超越挑战的目标。你可以在不退出原子级挑战的情况下完成它。（已升级）";
	if(player.m.effective.gte(183))return "超越挑战1的基础目标变为x^2。你可以在不退出原子级挑战的情况下完成它。";
	return "每秒获得重置可以获得的超越点数的0.2%。超越挑战1的基础目标变为x^2。你可以在不退出原子级挑战的情况下完成它。";
}
layers.m.milestones[111-1].effectDescription=function(){
	if(player.um.points.gte(111))return "在获得超级加成时不会重置。声望加成变得非常便宜了。解锁4个新的声望加成升级。解锁4个新的超越升级。（已升级）";
	return "在获得超级加成时不会重置。声望加成变得更便宜了。解锁4个新的声望加成升级。解锁4个新的超越升级。";
}
layers.m.milestones[112-1].effectDescription=function(){
	if(player.um.points.gte(112))return "超越挑战2、4、6、8的奖励变得更好，并且在进行超越挑战时生效。（已升级）";
	return "超越挑战2的奖励在进行超越挑战2时生效。";
}
layers.m.milestones[113-1].effectDescription=function(){
	if(player.um.points.gte(113))return "第6个和第27个里程碑的效果变为原来的(元里程碑数量)次方。（已升级）";
	if(player.m.effective.gte(183))return "第6个和第27个里程碑的效果变为原来的(元里程碑数量的0.3次方)次方。";
	return "每秒额外获得重置可以获得的超越点数的0.3%，总计0.5%。第6个和第27个里程碑的效果变为原来的(元里程碑数量的0.3次方)次方。";
}
layers.m.milestones[114-1].effectDescription=function(){
	if(player.um.points.gte(114))return "在超越时保留原子级挑战完成数（对每个超越挑战分别记录完成数，第7行重置时重置）。在超越挑战内自动更新超越挑战完成数。所有原子级挑战的完成次数永远不小于10，即使你在超越或转世挑战里面。（已升级）";
	return "在超越时保留原子级挑战完成数（对每个超越挑战分别记录完成数，第7行重置时重置）。在超越挑战内自动更新超越挑战完成数。";
}
layers.m.milestones[115-1].effectDescription=function(){
	if(player.um.points.gte(115))return "解锁一个超越挑战，并且这个超越挑战奖励的效果变得更好。（已升级）";
	if(player.m.effective.gte(183))return "解锁一个超越挑战。";
	return "每秒额外获得重置可以获得的超越点数的0.5%，总计1%。解锁一个超越挑战。";
}
layers.m.milestones[116-1].effectDescription=function(){
	if(player.um.points.gte(116))return "自动获得超级加成，并且超级加成变得更便宜。（已升级）";
	if(player.m.effective.gte(183))return "自动获得超级加成。";
	return "每秒额外获得重置可以获得的超越点数的1%，总计2%。自动获得超级加成。";
}
layers.m.milestones[117-1].effectDescription=function(){
	if(player.um.points.gte(117))return "声望加成变得更便宜了。（已升级）";
	if(player.m.effective.gte(183))return "声望加成变得更便宜了。";
	return "每秒额外获得重置可以获得的超越点数的3%，总计5%。声望加成变得更便宜了。";
}
layers.m.milestones[118-1].effectDescription=function(){
	if(player.um.points.gte(118))return "第四个里程碑的效果变得更好。（已升级）";
	if(player.m.effective.gte(183))return "第四个里程碑的效果变得更好。";
	return "每秒额外获得重置可以获得的超越点数的5%，总计10%。第四个里程碑的效果变得更好。";
}
layers.m.milestones[119-1].effectDescription=function(){
	if(player.um.points.gte(119))return "超级加成变得更便宜了。（已升级）";
	if(player.m.effective.gte(183))return "超级加成变得更便宜了。";
	return "每秒额外获得重置可以获得的超越点数的10%，总计20%。超级加成变得更便宜了。";
}
layers.m.milestones[120-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "原子级挑战的目标减少了，并且完成原子级挑战的次数可以不是整数。";
	return "每秒额外获得重置可以获得的超越点数的10%，总计30%。原子级挑战的目标减少了，并且完成原子级挑战的次数可以不是整数。";
}
layers.m.milestones[121-1].effectDescription="解锁一个声望可重复购买项。";
layers.m.milestones[122-1].effectDescription="原子级挑战4的点数减少公式被更改。原子级挑战2超过5次的完成数每次将奖励+0.015而不是+0.01。";
layers.m.milestones[123-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "自动购买第一个声望可重复购买项。";
	return "每秒额外获得重置可以获得的超越点数的15%，总计45%。自动购买第一个声望可重复购买项。";
}
layers.m.milestones[124-1].effectDescription="解锁4个新的声望升级。";
layers.m.milestones[125-1].effectDescription="解锁一个层级。这个层级不会被重置（除非你在进行第7行重置），同时这个层级不会重置任何东西。解锁一个超越挑战。解锁4个新的超越升级。";
layers.m.milestones[126-1].effectDescription="自动收集声望能量。";
layers.m.milestones[127-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "解锁4个新的超级声望升级。";
	return "每秒额外获得重置可以获得的超越点数的15%，总计60%。解锁4个新的超级声望升级。";
}
layers.m.milestones[128-1].effectDescription="超越升级54的效果变得更好。解锁一个原子级挑战。";
layers.m.milestones[129-1].effectDescription="解锁一个超级声望可重复购买项。";
layers.m.milestones[130-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "自动购买第二个超级声望可重复购买项。原子级挑战1-3和6的目标减少了。解锁一个新的超越标签页。";
	return "每秒额外获得重置可以获得的超越点数的20%，总计80%。自动购买第二个超级声望可重复购买项。原子级挑战1-3和6的目标减少了。解锁一个新的超越标签页。";
}
layers.m.milestones[131-1].effectDescription="解锁4个新的声望加成升级。";
layers.m.milestones[132-1].effectDescription="第二个超级声望可重复购买项的效果变得更好。";
layers.m.milestones[133-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "第105个里程碑的效果变为原来的1.2次方。";
	return "每秒额外获得重置可以获得的超越点数的20%，总计100%。第105个里程碑的效果变为原来的1.2次方。";
}
layers.m.milestones[134-1].effectDescription="在超越时保留超级加成升级。";
layers.m.milestones[135-1].effectDescription="第20个里程碑、第57个里程碑、第75个里程碑和第90个里程碑的效果变为1e12%。";
layers.m.milestones[136-1].effectDescription="解锁4个新的超越升级。原子级挑战5的目标减少了。";
layers.m.milestones[137-1].effectDescription="解锁一个超越挑战。超越的要求从1e850变为1e640，不改变超越点数的获得。";
layers.m.milestones[138-1].effectDescription="原子级挑战2超过5次的完成数每次将奖励+0.02而不是+0.015。";
layers.m.milestones[139-1].effectDescription="第4个里程碑、第6个里程碑和第27个里程碑的基础效果公式更好。";
layers.m.milestones[140-1].effectDescription="解锁一个层级。";
layers.m.milestones[141-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[142-1].effectDescription="解锁4个新的第三级声望升级。";
layers.m.milestones[143-1].effectDescription="第105个里程碑的效果变为原来的1.1次方。";
layers.m.milestones[144-1].effectDescription="原子级挑战2超过5次的完成数每次将奖励+0.025而不是+0.02。";
layers.m.milestones[145-1].effectDescription="自动获得第一个原子级挑战的完成数。";
layers.m.milestones[146-1].effectDescription="自动获得第二个原子级挑战的完成数。";
layers.m.milestones[147-1].effectDescription="自动获得第三个原子级挑战的完成数。";
layers.m.milestones[148-1].effectDescription="自动获得第五个原子级挑战的完成数。";
layers.m.milestones[149-1].effectDescription="自动获得第六个原子级挑战的完成数。";
layers.m.milestones[150-1].effectDescription="解锁一个层级。";
layers.m.milestones[151-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "每秒获得重置可以获得的超越点数的100%。";
	return "每秒额外获得重置可以获得的超越点数的100%，总计200%。";
}
layers.m.milestones[152-1].effectDescription="原子级挑战2,3,5,6的目标减少了。";
layers.m.milestones[153-1].effectDescription="解锁4个新的超越升级。";
layers.m.milestones[154-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "每秒额外获得重置可以获得的超越点数的100%，总计200%。";
	return "每秒额外获得重置可以获得的超越点数的100%，总计300%。";
}
layers.m.milestones[155-1].effectDescription="第105个里程碑的效果变为原来的1.03次方。";
layers.m.milestones[156-1].effectDescription="解锁一个声望可重复购买项。";
layers.m.milestones[157-1].effectDescription="基于点数和里程碑自动获得第四个原子级挑战的完成数。";
layers.m.milestones[158-1].effectDescription="解锁一个超越挑战。";
layers.m.milestones[159-1].effectDescription="第105个里程碑的效果变为原来的1.103次方。";
layers.m.milestones[160-1].effectDescription="解锁一个层级。";
layers.m.milestones[161-1].effectDescription="第157个里程碑将会基于第1个里程碑没有软上限时的点数获取。";
layers.m.milestones[162-1].effectDescription="第一个声望可重复购买项的效果更好。";
layers.m.milestones[163-1].effectDescription="超越的要求从1e640变为1e510，并稍微提升超越点数的获得。";
layers.m.milestones[164-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "每秒额外获得重置可以获得的超越点数的300%，总计500%。";
	return "每秒额外获得重置可以获得的超越点数的300%，总计600%。";
}
layers.m.milestones[165-1].effectDescription="基于里程碑升级，第1个里程碑的升级的效果变得更好。";
layers.m.milestones[166-1].effectDescription="原子级挑战1的目标减少了。";
layers.m.milestones[167-1].effectDescription="原子级挑战2的目标减少了。";
layers.m.milestones[168-1].effectDescription="原子级挑战3的目标减少了。";
layers.m.milestones[169-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[170-1].effectDescription="解锁一个超越挑战。";
layers.m.milestones[171-1].effectDescription="超越挑战8的效果变得更好。";
layers.m.milestones[172-1].effectDescription="超越挑战8的效果变得更好。";
layers.m.milestones[173-1].effectDescription="超越挑战8的效果变得更好。";
layers.m.milestones[174-1].effectDescription="超越挑战8的效果变得更好。";
layers.m.milestones[175-1].effectDescription="解锁一个层级。";
layers.m.milestones[176-1].effectDescription="自动获得第一个超越挑战的完成数和挑战点数。";
layers.m.milestones[177-1].effectDescription="自动获得第二个超越挑战的完成数和挑战点数。";
layers.m.milestones[178-1].effectDescription=function(){
	if(player.m.effective.gte(183))return "每秒额外获得重置可以获得的超越点数的500%，总计1000%。";
	return "每秒额外获得重置可以获得的超越点数的500%，总计1100%。";
}
layers.m.milestones[179-1].effectDescription="解锁原子升级。";
layers.m.milestones[180-1].effectDescription="基于里程碑，声望加成升级31的效果变得更好。";
layers.m.milestones[181-1].effectDescription="第165个里程碑的效果变得更好。";
layers.m.milestones[182-1].effectDescription="第三级声望升级22的效果变得更好。";
layers.m.milestones[183-1].effectDescription=function(){
	return "每秒额外获得重置可以获得的超越点数的1100%，总计2100%。但是去除所有在第150个里程碑之前每秒获得超越点数的效果。";
}
layers.m.milestones[184-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "转世不再重置升级。";
				}
	if(player[this.layer].best.gte(184)){
		return "里程碑之树正在变得不稳定...";
	}
	return "看起来这个里程碑好像有点不稳定..."
}
layers.m.milestones[185-1].effectDescription="解锁新的原子升级。";
layers.m.milestones[186-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "自动获得原子。原子不再重置任何东西。";
				}
	return "更不稳定了..."
}
layers.m.milestones[187-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "转世时保留元里程碑和额外里程碑。";
				}
	return "怎么解决这种不稳定的情况？"
}
layers.m.milestones[188-1].effectDescription="自动获得第三个超越挑战的完成数和挑战点数。";
layers.m.milestones[189-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "转世时保留里程碑升级。";
				}
	return "越来越不稳定了..."
}
layers.m.milestones[190-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "解锁新的原子升级。";
				}
	return "试一下增加一个层级，说不定可能会有效果..."
}
layers.m.milestones[191-1].effectDescription="第105个里程碑的效果变得更好。";
layers.m.milestones[192-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "自动获得第四个超越挑战的完成数和挑战点数。";
				}
	return "越来，越来越不稳定了..."
}
layers.m.milestones[193-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "原子级挑战1-3的目标减少了。";
				}
	return "增加一个大重置层级，说不定会有效果..."
}
layers.m.milestones[194-1].effectDescription="第105个里程碑的效果变为原来的1.067次方。";
layers.m.milestones[195-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[196-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "原子级挑战2超过5次的完成数每次将奖励+0.03而不是+0.025。";
				}
	return "我们只能通过大重置来修复这个问题了..."
}
layers.m.milestones[197-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "原子级挑战2超过5次的完成数每次将奖励+0.035而不是+0.03。";
				}
	return "一个第7行的大重置..."
}
layers.m.milestones[198-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "原子级挑战2超过5次的完成数每次将奖励+0.04而不是+0.035。";
				}
	return "里程碑之树已经非常不稳定了..."
}
layers.m.milestones[199-1].effectDescription=function(){
	return "解锁一个新的层级。"
}
layers.m.milestones[200-1].effectDescription=function(){
				if(player.r.stage>=1){
					return "基于你的总里程碑数量，超越点数和转世点数的获得变得更好。当前："+format(tmp.m.milestone200Effect)+"x";
				}
	return "..."
}
layers.m.milestones[201-1].effectDescription="超越挑战完成15次之后，目标会减少。";
layers.m.milestones[202-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[203-1].effectDescription="第三级声望升级22的效果变得更好。";
layers.m.milestones[204-1].effectDescription=layers.m.milestones[210-1].effectDescription="解锁一个新的转世可重复购买项。";
layers.m.milestones[205-1].effectDescription="每秒额外获得重置可以获得的超越点数的1100%，总计3200%。";
layers.m.milestones[206-1].effectDescription="转世不再重置超越挑战完成数和超越挑战点数。";
layers.m.milestones[207-1].effectDescription="解锁新的原子升级。";
layers.m.milestones[208-1].effectDescription=function(){
	return "基于你的总里程碑数量，超越点数和转世点数的获得公式变得更好。当前：^2 -> ^"+format(tmp.m.milestone208Effect);
}
layers.m.milestones[209-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[211-1].effectDescription="自动获得第五个超越挑战的完成数和挑战点数。";
layers.m.milestones[212-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[213-1].effectDescription="自动获得第七个超越挑战的完成数和挑战点数。";
layers.m.milestones[214-1].effectDescription="自动获得第六个超越挑战的完成数和挑战点数。";
layers.m.milestones[215-1].effectDescription="转世力量的获得变得更好。";
layers.m.milestones[216-1].effectDescription="解锁新的超级加成升级。";
layers.m.milestones[217-1].effectDescription="自动获得第八个超越挑战的完成数和挑战点数。";
layers.m.milestones[218-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[219-1].effectDescription="完成超越挑战的次数可以不是整数。";
layers.m.milestones[220-1].effectDescription="解锁转世（R）层级下的一个新功能。";
layers.m.milestones[221-1].effectDescription="解锁一个原子级声望购买项。";
layers.m.milestones[222-1].effectDescription="自动购买第一个原子级声望购买项。原子级挑战6影响第一个原子级声望购买项。";


layers.m.milestones[225-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[226-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";
layers.m.milestones[227-1].effectDescription="解锁一个第三级声望购买项。";
layers.m.milestones[228-1].effectDescription="自动购买第三个第三级声望购买项。";
layers.m.milestones[229-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";
layers.m.milestones[230-1].effectDescription="解锁NG+里面的第二个层级";
layers.m.milestones[231-1].effectDescription="解锁新的原子级声望升级。";
layers.m.milestones[232-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";

layers.m.milestones[234-1].effectDescription="解锁转世升级。";
layers.m.milestones[235-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";
layers.m.milestones[236-1].effectDescription="原子级挑战5的目标减少了。";
layers.m.milestones[237-1].effectDescription="原子级挑战6的目标减少了。";
layers.m.milestones[238-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";
layers.m.milestones[239-1].effectDescription="第105个里程碑的效果变为原来的1.01次方。";








layers.m.tabFormat[3][1]=function(){
	return "里程碑成本快速增加在"+format(tmp.m.getScalingStart,4)+"开始";
}
layers.m.tabFormat[4][1]=function(){
	if(player.m.points.gte(180)){return "第二次里程碑成本快速增加在"+format(tmp.m.getScalingStart2,4)+"开始";}return "";
}
layers.m.tabFormat[5][1]=function(){
	if(player.m.points.gte(200)){return "里程碑需求公式：10^(1+"+formatWhole(player.m.points)+"^(2+"+format(tmp.m.firstScaling,4)+"+"+format(tmp.m.secondScaling,4)+"))=10^(1+"+formatWhole(player.m.points)+"^"+format(tmp.m.exponent,4)+")";}
	return "里程碑成本指数是"+format(tmp.m.exponent,4);
}

layers.mm.resource="元里程碑";
layers.mm.effectDescription="";
layers.mm.baseResource=function() {if(player.r.stage>=1)return "有效里程碑";return "里程碑"};
layers.mm.resetDescription="获得";

i=0;
while(layers.mm.milestones[i]){
	layers.mm.milestones[i].requirementDescription="第"+(i+1)+"个元里程碑";
	i++;
}
layers.mm.milestones[1-1].effectDescription=function(){
	if(player.um.meta.gte(1))return "自动获得里程碑和里程碑升级。（已升级）"
	return "自动获得里程碑。";
}
layers.mm.milestones[2-1].effectDescription=layers.mm.milestones[3-1].effectDescription=layers.mm.milestones[4-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第27个里程碑的效果变为原来的平方。";
}
layers.mm.milestones[5-1].effectDescription=layers.mm.milestones[10-1].effectDescription=layers.mm.milestones[15-1].effectDescription=layers.mm.milestones[20-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "基于你的元里程碑数量，第三个里程碑的效果变得更好。（已升级）";
	return "基于你的元里程碑数量，第三个里程碑的效果变得更好。";
}
layers.mm.milestones[6-1].effectDescription=layers.mm.milestones[7-1].effectDescription=layers.mm.milestones[8-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第27个里程碑的效果变为原来的1.5次方。";
}
layers.mm.milestones[9-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第六个里程碑的效果变为原来的1.5次方。";
}
layers.mm.milestones[11-1].effectDescription=layers.mm.milestones[12-1].effectDescription=layers.mm.milestones[16-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第27个里程碑的效果变为原来的1.2次方。";
}
layers.mm.milestones[13-1].effectDescription=layers.mm.milestones[14-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第六个里程碑的效果变为原来的1.2次方。";
}
layers.mm.milestones[17-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第六个里程碑的效果变为原来的1.7次方。";
}
layers.mm.milestones[18-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第27个里程碑的效果变为原来的1.8次方。";
}
layers.mm.milestones[19-1].effectDescription=function(){
	if(player.um.meta.gte(parseInt(this.id)+1))return "第6个和第27个里程碑的效果变为原来的平方。（已升级）"
	return "第27个里程碑的效果变为原来的1.9次方。";
}
layers.mm.milestones[21-1].effectDescription=layers.mm.milestones[22-1].effectDescription=layers.mm.milestones[23-1].effectDescription=layers.mm.milestones[24-1].effectDescription="超越点数的获得变为原来的2倍。";
layers.mm.milestones[26-1].effectDescription=layers.mm.milestones[27-1].effectDescription=layers.mm.milestones[28-1].effectDescription=layers.mm.milestones[29-1].effectDescription="声望能量的获得变为原来的2倍。";
layers.mm.milestones[25-1].effectDescription=function(){
	return "基于你的元里程碑数量，超越点数的获得变得更好。当前："+format(tmp.mm.meta25Effect)+"x";
}
layers.mm.milestones[30-1].effectDescription="第25个元里程碑的效果变为原来的平方。解锁一个新层级。";
layers.mm.milestones[31-1].effectDescription=layers.mm.milestones[32-1].effectDescription=layers.mm.milestones[33-1].effectDescription=layers.mm.milestones[34-1].effectDescription="声望能量的获得变为原来的2倍。";
layers.mm.milestones[35-1].effectDescription="基础声望能量的获得变为原来的1.1次方。声望能量的获得变为原来的1.741倍。";
layers.mm.milestones[36-1].effectDescription=layers.mm.milestones[37-1].effectDescription=layers.mm.milestones[38-1].effectDescription=layers.mm.milestones[39-1].effectDescription="超级能量的获得变为原来的2倍。";
layers.mm.milestones[40-1].effectDescription=layers.mm.milestones[45-1].effectDescription="转世点数的获得变为原来的2倍。";
layers.mm.milestones[41-1].effectDescription=layers.mm.milestones[42-1].effectDescription=layers.mm.milestones[43-1].effectDescription=layers.mm.milestones[44-1].effectDescription="超级能量的获得变为原来的2倍。";


layers.em.resource="额外里程碑";
layers.em.effectDescription="";
layers.em.baseResource="元里程碑";
layers.em.resetDescription="获得";

i=0;
while(layers.em.milestones[i]){
	layers.em.milestones[i].requirementDescription="第"+(i+1)+"个额外里程碑";
	i++;
}
layers.em.milestones[1-1].effectDescription="自动获得元里程碑。";
layers.em.milestones[2-1].effectDescription="基于你的额外里程碑数量，第三个里程碑的效果变得更好。";
layers.em.milestones[3-1].effectDescription="解锁4个新的超级能量升级。";
layers.em.milestones[4-1].effectDescription=function(){
	if(player.em.points.gte(8))return "超越点数的获得变为原来的"+format(player.em.points)+"倍。";
	if(player.em.points.gte(7))return "超越点数的获得变为原来的"+format(player.em.points.sqrt())+"倍。";
	return "超越点数的获得变为原来的1.1倍。";
}
layers.em.milestones[5-1].effectDescription="里程碑升级变得更便宜。";
layers.em.milestones[6-1].effectDescription="解锁4个新的终极能量升级。";
layers.em.milestones[7-1].effectDescription="基于你的额外里程碑数量，第4个额外里程碑的效果变得更好。";
layers.em.milestones[8-1].effectDescription="第4个额外里程碑的效果变为原来的平方。";
layers.em.milestones[9-1].effectDescription="里程碑升级变得更便宜。";
layers.em.milestones[10-1].effectDescription="转世点数的获得变为原来的2倍。";
layers.em.milestones[11-1].effectDescription="解锁一个超越可购买项。";
layers.em.milestones[12-1].effectDescription="解锁一个超越可购买项。";

layers.p.resource="声望点数";
layers.p.effectDescription="";
layers.p.baseResource="点数";
layers.p.resetDescription="重置以获得";

for(i in layers.p.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.p.upgrades[i].title="声望升级"+i;
}
layers.p.upgrades[11].description=layers.p.upgrades[12].description="基于你的声望点数，第一个里程碑的效果变得更好。";
layers.p.upgrades[13].description=layers.p.upgrades[14].description="基于你的声望点数，声望点数的获得变得更好。";
layers.p.upgrades[21].description=layers.p.upgrades[22].description=function(){ if(player.um.points.gte(21))return "第六个里程碑的效果变为原来的平方。";return "第六个里程碑的效果变为原来的1.5次方。";};
layers.p.upgrades[23].description=layers.p.upgrades[24].description="基于你的声望点数，第三个里程碑的效果变得更好。";
layers.p.upgrades[31].description="基于你的声望点数，里程碑成本快速增加的效果变得更慢。";
layers.p.upgrades[32].description=layers.p.upgrades[33].description=layers.p.upgrades[34].description="声望升级31的效果变得更好。";
layers.p.upgrades[31].effectDisplay=function(){return format(this.effect(),4)+"x";}
layers.p.upgrades[41].description="这个升级和声望升级23的效果一样，但是你需要通过19.7次原子级挑战4才能购买这个升级。";
layers.p.upgrades[42].description="这个升级和声望升级23的效果一样，但是你需要通过14.1次原子级挑战3才能购买这个升级。";
layers.p.upgrades[43].description="第一个声望可重复购买项的效果更好，你需要在超越挑战2里面购买这个升级。";
layers.p.upgrades[44].description="第一个声望可重复购买项的效果更好，你需要在超越挑战4里面购买这个升级。";
layers.p.upgrades[44].currencyDisplayName="点数";

layers.p.upgrades.cols=5;
layers.p.upgrades[15]={
	title:"声望升级15",
	fullDisplay(){
		return "<h3>声望升级15</h3><br>这是一个只有中文版才有的彩蛋。使第1个里程碑的效果+1，不受挑战和倍数的影响。<br><br>花费：<作者的QQ> 声望点数";
	},
    cost: new Decimal(1010903229),
    unlocked() { return true}, // The upgrade is only visible when this is true
}
layers.p.upgrades[25]={
	title:"声望升级25",
	fullDisplay(){
		return "<h3>声望升级25</h3><br>这是一个只有中文版才有的彩蛋。使第1个里程碑的效果+1，不受挑战和倍数的影响。<br><br>花费：1e<作者的QQ> 声望点数";
	},
    cost: new Decimal("1e1010903229"),
    unlocked() { return true}, // The upgrade is only visible when this is true
}
layers.p.upgrades[35]={
	title:"声望升级35",
	fullDisplay(){
		return "<h3>声望升级35</h3><br>这是一个只有中文版才有的彩蛋。使第1个里程碑的效果+1，不受挑战和倍数的影响。<br><br>花费：<作者的QQ>e<作者的QQ> 声望点数";
	},
    cost: new Decimal("1010903229e1010903229"),
    unlocked() { return true}, // The upgrade is only visible when this is true
}
layers.p.upgrades[45]={
	title:"声望升级45",
	fullDisplay(){
		return "<h3>声望升级45</h3><br>这是一个只有中文版才有的彩蛋。使第1个里程碑的效果+1，不受挑战和倍数的影响。<br><br>花费：<作者的QQ>^<作者的QQ> 声望点数";
	},
    cost: new Decimal("1010903229^1010903229"),
    unlocked() { return true}, // The upgrade is only visible when this is true
}

layers.p.buyables[11].title="软上限延迟器";
layers.p.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"声望点数";
};
layers.p.buyables[12].title="声望点数倍数";
layers.p.buyables[12].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"声望点数的获得乘以"+format(data.effect)+"。<br>"+
	"花费："+format(data.cost)+"声望点数";
};

var oldGetPointGenBeforeSoftcap=getPointGenBeforeSoftcap;
getPointGenBeforeSoftcap=function(){
	var b=oldGetPointGenBeforeSoftcap();
	if(hasUpgrade("p",15))b=b.add(1);
	if(hasUpgrade("p",25))b=b.add(1);
	if(hasUpgrade("p",35))b=b.add(1);
	if(hasUpgrade("p",45))b=b.add(1);
	return b;
}

layers.sp.resource="超级声望点数";
layers.sp.effectDescription="";
layers.sp.baseResource="声望点数";
layers.sp.resetDescription="重置以获得";

for(i in layers.sp.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.sp.upgrades[i].title="超级声望升级"+i;
}
layers.sp.upgrades[11].description=layers.sp.upgrades[12].description="基于你的超级声望点数，第一个里程碑的效果变得更好。";
layers.sp.upgrades[13].description=layers.sp.upgrades[14].description="基于你的超级声望点数，声望点数的获得变得更好。";
layers.sp.upgrades[21].description=layers.sp.upgrades[22].description="基于你的超级声望点数，超级声望点数的获得变得更好。";
layers.sp.upgrades[23].description="第6个里程碑与第27个里程碑的效果分别变为原来的(2+元里程碑数量)次方。";
layers.sp.upgrades[24].description="基于你的超级声望点数，第三个里程碑的效果变得更好。";
layers.sp.upgrades[31].description="基于你的超级声望点数，里程碑成本快速增加的效果变得更慢。";
layers.sp.upgrades[32].description=layers.sp.upgrades[33].description=layers.sp.upgrades[34].description="超级声望升级31的效果变得更好。";
layers.sp.upgrades[31].effectDisplay=function(){return format(this.effect(),4)+"x";}
layers.sp.upgrades[41].description="这个升级和超级声望升级24的效果一样，但是你需要通过15次原子级挑战2才能购买这个升级。";
layers.sp.upgrades[42].description="这个升级和超级声望升级24的效果一样，但是你需要通过21次原子级挑战4才能购买这个升级。";
layers.sp.upgrades[43].description="第一个超级声望可重复购买项更便宜，你需要在原子级挑战6里面购买这个升级。";
layers.sp.upgrades[44].description="第一行超级声望升级的效果更好，你需要在超越挑战5里面购买这个升级。";

layers.sp.buyables[11].title="声望点数倍数";
layers.sp.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"声望点数的获得乘以"+format(data.effect)+"。<br>"+
	"花费："+format(data.cost)+"超级声望点数";
};
layers.sp.buyables[12].title="软上限延迟器";
layers.sp.buyables[12].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"超级声望点数";
};

layers.pb.resource="声望加成";
layers.pb.effectDescription=function(){
	return "声望点数变为原来的"+format(layers.pb.effect(),4)+"次方。";
};
layers.pb.baseResource="声望点数";
layers.pb.resetDescription="重置以获得";

for(i in layers.pb.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.pb.upgrades[i].title="声望加成升级"+i;
}
layers.pb.upgrades[11].description=layers.pb.upgrades[12].description=layers.pb.upgrades[13].description=layers.pb.upgrades[14].description="声望加成的效果变得更好。";
layers.pb.upgrades[21].description=layers.pb.upgrades[22].description=layers.pb.upgrades[23].description=layers.pb.upgrades[24].description="声望加成的效果变得更好。";
layers.pb.upgrades[31].description="声望加成以较小的程度影响第一个里程碑的软上限。";
layers.pb.upgrades[32].description=layers.pb.upgrades[33].description=layers.pb.upgrades[34].description="声望加成升级31的效果变得更好。";
layers.pb.upgrades[41].description="基于你的超级声望点数，声望加成价格快速增加的效果变得更慢。你需要在原子级挑战2里面购买这个升级。";
layers.pb.upgrades[42].description="基于你的声望加成，第3个里程碑的效果变得更好。你需要在原子级挑战3里面购买这个升级。";
layers.pb.upgrades[43].description="声望加成升级31的效果变得更好，你需要在超越挑战2里面购买这个升级。";
layers.pb.upgrades[44].description="声望加成的效果变得更好，你需要通过18次原子级挑战5才能购买这个升级。";

layers.hp.resource="第三级声望点数";
layers.hp.effectDescription="";
layers.hp.baseResource="超级声望点数";
layers.hp.resetDescription="重置以获得";

for(i in layers.hp.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.hp.upgrades[i].title="第三级声望升级"+i;
}
layers.hp.upgrades[11].description=layers.hp.upgrades[12].description="基于你的第三级声望点数，第一个里程碑的效果变得更好。";
layers.hp.upgrades[13].description=layers.hp.upgrades[14].description="基于你的第三级声望点数，声望点数的获得变得更好。";
layers.hp.upgrades[21].description="基于你的第三级声望点数，超级声望点数的获得变得更好。";
layers.hp.upgrades[22].description="基于你的第三级声望点数，超级声望点数和第三级声望点数的获得变得更好。";
layers.hp.upgrades[23].description="基于你的第三级声望点数，里程碑成本快速增加的效果变得更慢。";
layers.hp.upgrades[24].description=layers.hp.upgrades[33].description=layers.hp.upgrades[34].description="第三级声望升级23的效果变得更好。";
layers.hp.upgrades[31].description="第一个超级声望可重复购买项的效果变为原来的1.05次方。";
layers.hp.upgrades[32].description="第一个第三级声望可重复购买项的效果变为原来的1.1次方。";
layers.hp.upgrades[23].effectDisplay=function(){return format(this.effect(),4)+"x";}
layers.hp.upgrades[41].description="第一个第三级声望可重复购买项更便宜，你需要在原子级挑战6里面购买这个升级。";
layers.hp.upgrades[42].description="第二个第三级声望可重复购买项更便宜，你需要在原子级挑战6里面购买这个升级。";
layers.hp.upgrades[43].description="第一个第三级声望可重复购买项更便宜，你需要在原子级挑战6里面购买这个升级。";
layers.hp.upgrades[44].description="第二个第三级声望可重复购买项更便宜，你需要在原子级挑战6里面购买这个升级。";

layers.hp.buyables[11].title="声望点数倍数";
layers.hp.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"声望点数的获得乘以"+format(data.effect)+"。<br>"+
	"花费："+format(data.cost)+"第三级声望点数";
};
layers.hp.buyables[12].title="超级倍数";
layers.hp.buyables[12].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"超级声望点数的获得乘以"+format(data.effect)+"。<br>"+
	"花费："+format(data.cost)+"第三级声望点数";
};
layers.hp.buyables[21].title="软上限延迟器";
layers.hp.buyables[21].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"第三级声望点数";
};

layers.ap.resource="原子级声望点数";
layers.ap.effectDescription="";
layers.ap.baseResource="第三级声望点数";
layers.ap.resetDescription="重置以获得";

for(i in layers.ap.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.ap.upgrades[i].title="原子级声望升级"+i;
}
layers.ap.upgrades[11].description="基于你的原子级声望点数，第一个里程碑的效果变得更好。";
layers.ap.upgrades[12].description="基于你的原子级声望点数，声望点数的获得变得更好。";
layers.ap.upgrades[13].description="基于你的原子级声望点数，超级声望点数的获得变得更好。";
layers.ap.upgrades[14].description="基于你的原子级声望点数，第三级声望点数的获得变得更好。";
layers.ap.upgrades[21].description="基于你的原子级声望点数，原子级声望点数的获得变得更好。";
layers.ap.upgrades[22].description="每一个第二行原子级声望升级会解锁一个在原子级声望层级下的挑战。";
layers.ap.upgrades[23].description="基于你的原子级声望点数，里程碑成本快速增加的效果变得更慢。";
layers.ap.upgrades[24].description="原子级声望升级23的效果变得更好。";
layers.ap.upgrades[31].description="第二个第三级声望可重复购买项的效果变为原来的1.5次方。";
layers.ap.upgrades[32].description="基于你的原子级声望点数，第一个里程碑的软上限开始得更迟。";
layers.ap.upgrades[33].description=layers.ap.upgrades[34].description="原子级声望升级23和32的效果变得更好。";
layers.ap.upgrades[23].effectDisplay=function(){return format(this.effect(),4)+"x";}
layers.ap.upgrades[32].effectDisplay=function(){return format(this.effect(),4)+"x";}
layers.ap.upgrades[41].description="原子级声望升级32的效果变得更好，你需要在超越挑战2里面购买这个升级。";
layers.ap.upgrades[42].description="原子级声望升级32的效果变得更好，你需要在超越挑战4里面购买这个升级。";
layers.ap.upgrades[43].description="原子级声望升级32的效果变得更好，你需要在超越挑战6里面购买这个升级。";

layers.ap.challenges[11].name="无声望加成挑战";
layers.ap.challenges[12].name="无超级声望挑战";
layers.ap.challenges[21].name="无自加成挑战";
layers.ap.challenges[22].name="点数减少挑战";
layers.ap.challenges[31].name="无声望挑战";
layers.ap.challenges[32].name="禁用的可重复购买项";
layers.ap.challenges[11].challengeDescription=function(){
	return "你不能获得声望加成。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[12].challengeDescription=function(){
	return "你不能获得超级声望点数。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[21].challengeDescription=function(){
	return "第三个里程碑的效果始终为1。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[22].challengeDescription=function(){
	if(player.m.effective.gte(122))return "第一个里程碑的效果被替换为其常用对数的(里程碑数量)次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
	return "第一个里程碑的效果被替换为其常用对数的100次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[31].challengeDescription=function(){
	return "你不能获得声望点数。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[32].challengeDescription=function(){
	return "所有的声望、超级声望和第三级声望可重复购买项没有效果。<br>已完成"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+"次"
}
layers.ap.challenges[11].currencyDisplayName="点数";
layers.ap.challenges[12].currencyDisplayName="点数";
layers.ap.challenges[21].currencyDisplayName="点数";
layers.ap.challenges[22].currencyDisplayName="点数";
layers.ap.challenges[31].currencyDisplayName="点数";
layers.ap.challenges[32].currencyDisplayName="点数";
layers.ap.challenges[11].rewardDescription=layers.ap.challenges[31].rewardDescription="声望加成的效果变得更好。";
layers.ap.challenges[12].rewardDescription="超级声望点数的获得变得更好。";
layers.ap.challenges[12].rewardDisplay=function(){ return "超级声望点数变为原来的"+format(this.rewardEffect())+"次方。" };
layers.ap.challenges[21].rewardDescription=layers.ap.challenges[22].rewardDescription="第三个里程碑的效果变得更好。";
layers.ap.challenges[32].rewardDescription="所有的声望、超级声望和第三级声望可重复购买项的效果变得更好。";
layers.ap.challenges[32].rewardDisplay=function(){ return "所有的声望、超级声望和第三级声望可重复购买项的效果变为原来的"+format(this.rewardEffect())+"次方。" };

layers.ap.buyables[11].title="软上限延迟器";
layers.ap.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"原子级声望点数";
};

layers.t.resource="超越点数";
layers.t.effectDescription="";
layers.t.baseResource="原子级声望点数";
layers.t.resetDescription="重置以获得";

for(i in layers.t.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.t.upgrades[i].title="超越升级"+i;
}
layers.t.upgrades[11].description=layers.t.upgrades[23].description=layers.t.upgrades[31].description="第三个里程碑的效果变为原来的1.005次方。";
layers.t.upgrades[12].description=layers.t.upgrades[32].description="声望点数的获得变为原来的1.005次方。";
layers.t.upgrades[13].description=layers.t.upgrades[33].description="超级声望点数的获得变为原来的1.005次方。";
layers.t.upgrades[14].description=layers.t.upgrades[34].description="第三级声望点数的获得变为原来的1.005次方。";
layers.t.upgrades[21].description="声望升级31和超级声望升级31的效果变得更好。";
layers.t.upgrades[22].description="原子级声望点数的获得变为原来的1.01次方。";
layers.t.upgrades[24].description="使声望加成变得更便宜。";
layers.t.upgrades[41].description=function(){return "使超级加成的价格除以"+format("1e60000")};
layers.t.upgrades[42].description="获得一个额外的超级加成。";
layers.t.upgrades[43].description="超级加成的效果变得更好。";
layers.t.upgrades[44].description="解锁4个新的原子级声望升级。";
layers.t.upgrades[51].description="第一个第三级声望可重复购买项的效果变为原来的2.1次方。";
layers.t.upgrades[52].description="基于你的超越点数，里程碑成本快速增加开始得更迟。";
layers.t.upgrades[53].description="减小第一个里程碑软上限的效力。";
layers.t.upgrades[54].description="基于你的超越点数，第一个里程碑的软上限开始得更迟。";
layers.t.upgrades[61].description="所有的膨胀挑战效果+0.05。";
layers.t.upgrades[62].description="基于你的超越点数，原子级声望点数的获得变得更好。";
layers.t.upgrades[63].description="基于你的超越点数，超越点数的获得变得更好。";
layers.t.upgrades[64].description=function(){return "使超级加成的价格除以"+format("1e300000")};
layers.t.upgrades[71].description=function(){return "使超级加成的价格除以"+format("1e30000")};
layers.t.upgrades[72].description="基于你的超越点数，元里程碑变得更便宜。";
layers.t.upgrades[73].description="基于你的原子级挑战完成数，第一个里程碑的软上限开始得更迟。";
layers.t.upgrades[74].description="超越升级72和73的效果变得更好。";
layers.t.upgrades[81].description="超越升级52的效果变得更好。";
layers.t.upgrades[82].description="超越升级73的效果变得更好。";
layers.t.upgrades[83].description="超越升级54的效果变得更好。";
layers.t.upgrades[84].description="超越升级63的效果变得更好。";

layers.t.challenges[11].name="点数膨胀挑战";
layers.t.challenges[12].name="软上限挑战";
layers.t.challenges[21].name="声望膨胀挑战";
layers.t.challenges[22].name="硬上限挑战";
layers.t.challenges[31].name="超级膨胀挑战";
layers.t.challenges[32].name="声望硬上限挑战";
layers.t.challenges[41].name="终极膨胀挑战";
layers.t.challenges[42].name="超级硬上限挑战";
layers.t.challenges[11].challengeDescription=function(){
	return "第一个里程碑的效果变为原来的"+format(tmp.t.dilationEffect)+"次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +"次"
}
layers.t.challenges[12].challengeDescription=function(){
	return "第一个里程碑的软上限开始得更早。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +"次"
}
layers.t.challenges[21].challengeDescription=function(){
	return "在“点数膨胀挑战”的基础上，声望点数的获得变为原来的"+format(tmp.t.dilationEffect)+"次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+"次"
}
layers.t.challenges[22].challengeDescription=function(){
	return "在“软上限挑战”的基础上，第一个里程碑的软上限变为硬上限。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+"次"
}
layers.t.challenges[31].challengeDescription=function(){
	return "在“声望膨胀挑战”的基础上，超级声望点数的获得变为原来的"+format(tmp.t.dilationEffect)+"次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +"次"
}
layers.t.challenges[32].challengeDescription=function(){
	return "在“硬上限挑战”的基础上，声望点数的获得受第一个里程碑的软上限影响。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+"次"
}
layers.t.challenges[41].challengeDescription=function(){
	return "在“超级膨胀挑战”的基础上，第三级声望点数的获得变为原来的"+format(tmp.t.dilationEffect)+"次方。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +"次"
}
layers.t.challenges[42].challengeDescription=function(){
	return "在“声望硬上限挑战”的基础上，超级声望点数的获得受第一个里程碑的软上限影响。<br>已完成"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+"次"
}
layers.t.challenges[11].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[12].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[21].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[22].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[31].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[32].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[41].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[42].currencyDisplayName="原子级挑战完成数";
layers.t.challenges[11].rewardDescription=layers.t.challenges[21].rewardDescription=layers.t.challenges[31].rewardDescription=layers.t.challenges[41].rewardDescription="第三个里程碑的效果变得更好。";
layers.t.challenges[12].rewardDescription=function(){ 
	if(player.m.effective.lt(112))return "第一个里程碑的软上限开始得更迟。当你在这个挑战里面时这个奖励无效。";
	else return "第一个里程碑的软上限开始得更迟。";
}
layers.t.challenges[22].rewardDescription=layers.t.challenges[32].rewardDescription=layers.t.challenges[42].rewardDescription="第一个里程碑的软上限开始得更迟。";
layers.t.tabFormat.Main.content[3][1]=function(){
	if(player.r.stage>=1)return "超越点数的硬上限为"+format(layers.t.hardcap());return "";
}
layers.t.tabFormat.Challenges.content[1][1]="超越挑战先生效，原子级挑战再生效，软上限最后生效。";
layers.t.tabFormat.Challenges.content[2][1]=function(){
	let c=0;
	for(var i in player.ap.challenges)c+=player.ap.challenges[i];
	return "原子级挑战完成数："+format(c,4)+(player.m.effective.gte(230)?("+"+format(layers.ap.freeChall().toNumber()*6,4)):"")
}
layers.t.tabFormat["Special Transcend Points"].content=[
				"main-display",
				["display-text",function(){return "在超越挑战中得到"+format(tmp.t.requires1)+"原子级声望点数，即可得到超越挑战点数！"}],
				function(){if(!player.t.activeChallenge)return ["display-text","你不在超越挑战中，无法得到超越挑战点数！"];return "resource-display"},
				["display-text",function(){if(!player.t.activeChallenge || player.t.specialPoints[player.t.activeChallenge].gte(1e6))return "";return "下一个"+layers.t.getSpecialTPName(player.t.activeChallenge)+"在"+format(tmp.t.getNextSPAt)+"原子级声望点数"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[11])+layers.t.getSpecialTPName(11)+"，第3个里程碑的效果变为原来的"+format(layers.t.getSpecialEffect(11),4)+"次方"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[12])+layers.t.getSpecialTPName(12)+"，第1个里程碑的软上限延迟"+format(layers.t.getSpecialEffect(12),4)+"倍出现"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[21])+layers.t.getSpecialTPName(21)+"，声望点数变为原来的"+format(layers.t.getSpecialEffect(21),4)+"次方"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[22])+layers.t.getSpecialTPName(22)+"，第1个里程碑的软上限延迟"+format(layers.t.getSpecialEffect(22),4)+"倍出现"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[31])+layers.t.getSpecialTPName(31)+"，超级声望点数变为原来的"+format(layers.t.getSpecialEffect(31),4)+"次方"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[32])+layers.t.getSpecialTPName(32)+"，第1个里程碑的软上限延迟"+format(layers.t.getSpecialEffect(32),4)+"倍出现"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[41])+layers.t.getSpecialTPName(41)+"，第三级声望点数变为原来的"+format(layers.t.getSpecialEffect(41),4)+"次方"}],
				["display-text",function(){return "你有"+format(player.t.specialPoints[42])+layers.t.getSpecialTPName(42)+"，第1个里程碑的软上限延迟"+format(layers.t.getSpecialEffect(42),4)+"倍出现"}],
			],
layers.t.getSpecialTPName=function(a){
	return layers.t.challenges[a]?.name+"点数";
}
layers.t.buyables[11].title="软上限延迟器";
layers.t.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"超越点数";
};
layers.t.buyables[12].title="超级声望点数加成";
layers.t.buyables[12].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"超级声望点数变为原来的"+format(data.effect)+"次方。<br>"+
	"花费："+format(data.cost)+"超越点数";
};


layers.hb.resource="超级加成";
layers.hb.effectDescription=function(){
	return "第三级声望点数变为原来的"+format(layers.hb.effect(),4)+"次方，声望加成的效果变为原来的"+format(layers.hb.effect(),4)+"次方。";
};
layers.hb.baseResource="第三级声望点数";
layers.hb.resetDescription="重置以获得";

for(i in layers.hb.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.hb.upgrades[i].title="超级加成升级"+i;
}
layers.hb.upgrades[11].description="超级加成影响第一个里程碑的软上限。";
layers.hb.upgrades[12].description="重置获得的超级加成提供额外的声望加成。";
layers.hb.upgrades[31].description="原子升级11的效果提供额外的声望加成。";
layers.hb.upgrades[13].description=layers.hb.upgrades[14].description="超级加成的效果变得更好。";
layers.hb.upgrades[21].description=layers.hb.upgrades[22].description=layers.hb.upgrades[23].description=layers.hb.upgrades[24].description=layers.hb.upgrades[32].description=layers.hb.upgrades[33].description=layers.hb.upgrades[34].description="超级加成升级12的效果变得更好。";

layers.a.resource="原子";
layers.a.effectDescription=function(){
	return "原子级声望点数变为原来的"+format(layers.a.effect(),4)+"次方，超级加成的效果变为原来的"+format(layers.a.effect(),4)+"次方。";
};
layers.a.baseResource="原子级声望点数";
layers.a.resetDescription="重置以获得";

for(i in layers.a.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.a.upgrades[i].title="原子升级"+i;
}
layers.a.upgrades[11].description="原子影响第一个里程碑的软上限。";
layers.a.upgrades[12].description=layers.a.upgrades[13].description=layers.a.upgrades[14].description=layers.a.upgrades[21].description=layers.a.upgrades[22].description="超级加成升级12的效果变得更好。";
layers.a.upgrades[23].description="重置获得的原子提供额外的超级加成。";
layers.a.upgrades[24].description="原子升级23的效果变得更好。";

layers.pe.resource="声望能量";
layers.pe.baseResource="声望点数";
layers.pe.resetDescription="收集";

for(i in layers.pe.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.pe.upgrades[i].title="声望能量升级"+i;
}
layers.pe.upgrades[11].description="基于你的声望能量，第一个里程碑的软上限开始得更迟。";
layers.pe.upgrades[12].description="基于你的声望能量，里程碑成本快速增加的效果变得更慢。";
layers.pe.upgrades[13].description=layers.pe.upgrades[23].description="声望能量升级11的效果变得更好。";
layers.pe.upgrades[14].description=layers.pe.upgrades[22].description="声望能量升级12的效果变得更好。";
layers.pe.upgrades[21].description="基于你的声望能量，超越点数的获得变得更好。";
layers.pe.upgrades[24].description="声望能量升级21的效果变得更好。";
layers.pe.tabFormat[2][1]=function(){
	let power=new Decimal(1).div(tmp.pe.exponent);
	return "声望能量="+format(tmp.pe.directMult)+"*log10(最高声望点数)^"+format(power);
}

layers.se.resource="超级能量";
layers.se.baseResource="超级声望点数";
layers.se.resetDescription="收集";

for(i in layers.se.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.se.upgrades[i].title="超级能量升级"+i;
}
layers.se.upgrades[11].description="基于你的超级能量，第一个里程碑的软上限开始得更迟。";
layers.se.upgrades[12].description="基于你的超级能量，里程碑成本快速增加的效果变得更慢。";
layers.se.upgrades[13].description="超级能量升级11的效果变得更好。";
layers.se.upgrades[14].description="超级能量升级12的效果变得更好。";
layers.se.upgrades[21].description="超级能量升级11的效果变得更好。";
layers.se.upgrades[22].description="基于你的超级能量，超越点数的获得变得更好。";
layers.se.upgrades[23].description="超级能量升级12的效果变得更好。";
layers.se.upgrades[24].description="超级能量升级22的效果变得更好。";
layers.se.tabFormat[2][1]=function(){
	let power=new Decimal(1).div(tmp.se.exponent);
	return "超级能量="+format(tmp.se.directMult)+"*log10(最高超级声望点数)^"+format(power);
}

layers.he.resource="终极能量";
layers.he.baseResource="第三级声望点数";
layers.he.resetDescription="收集";


for(i in layers.he.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.he.upgrades[i].title="终极能量升级"+i;
}
layers.he.upgrades[11].description="基于你的终极能量，第一个里程碑的软上限开始得更迟。";
layers.he.upgrades[12].description="基于你的终极能量，里程碑成本快速增加的效果变得更慢。";
layers.he.upgrades[13].description="终极能量升级11的效果变得更好。";
layers.he.upgrades[14].description="终极能量升级12的效果变得更好。";
layers.he.upgrades[21].description="终极能量升级11的效果变得更好。";
layers.he.upgrades[22].description="基于你的终极能量，超越点数的获得变得更好。";
layers.he.tabFormat[2][1]=function(){
	let power=new Decimal(1).div(tmp.he.exponent);
	return "终极能量="+format(tmp.he.directMult)+"*log10(最高第三级声望点数)^"+format(power);
}
layers.he.upgrades[23].description="终极能量升级11的效果变得更好。";
layers.he.upgrades[24].description="声望能量升级11和超级能量升级11的效果变得更好。";

layers.um.resource="里程碑升级";
layers.um.baseResource="点数";
layers.um.resetDescription="获得";
layers.um.effectDescription=function(){
		if(player.um.meta.gte(1)){
			return "提供"+format(player.um.meta)+"元里程碑升级";
		}
		return "";
	};
	
	
layers.r.resource="转世点数";
layers.r.effectDescription=function(){
	return "产生"+format(layers.r.powerGain())+"转世力量每秒";
}
layers.r.baseResource="超越点数";
layers.r.resetDescription="重置以获得";
layers.r.tabFormat.Main.content[3][1]=function(){
	return "你有"+format(player.r.power)+"转世力量";
}

layers.r.clickables[11].title=function(){
	if(player.r.universe==1)return "返回原来的里程碑之树";
	return "进入NG+宇宙";
}

layers.r.buyables[11].title="重新生效里程碑";
layers.r.buyables[11].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
	"使前"+formatWhole(data.effect)+"个里程碑重新生效<br>"+
	"花费："+format(data.cost)+"转世力量";
};
layers.r.buyables[12].title="软上限延迟器";
layers.r.buyables[12].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"第一个里程碑的软上限开始得更迟。当前："+format(data.effect)+"x<br>"+
	"花费："+format(data.cost)+"转世力量";
};
layers.r.buyables[21].title="超越点数倍数";
layers.r.buyables[21].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"超越点数的获得变为原来的"+format(data.effect)+"倍。<br>"+
	"花费："+format(data.cost)+"转世力量";
};
layers.r.buyables[22].title="声望能量倍数";
layers.r.buyables[22].display=function(){
	let data = tmp[this.layer].buyables[this.id];
	return "等级："+format(player[this.layer].buyables[this.id])+"<br>"+
	"声望能量的获得变为原来的"+format(data.effect)+"倍。<br>"+
	"花费："+format(data.cost)+"转世力量";
};

for(i in layers.r.upgrades){
	if(i=="rows"||i=="cols")continue;
	layers.r.upgrades[i].title="转世升级"+i;
}
layers.r.upgrades[11].description="转世力量的获得变为原来的2倍。";
layers.r.upgrades[12].description="转世点数的获得变为原来的2倍。";


layers.pp.resource="声望力量";
layers.pp.baseResource="声望点数";
layers.pp.resetDescription="重置以获得";
