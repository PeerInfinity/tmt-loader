if(document.location.href.indexOf("qq1010903229.github.io")==-1 && document.location.href.indexOf("loader3229.github.io")==-1 && document.location.href.indexOf("qq1010903229.gitee.io")== -1){
	displayThings[2]=window.cnItems?"您所游玩的版本可能不是最新版，<a href=https://loader3229.github.io/milestone-tree/index2.html>跳转到最新版</a>":"Your playing site is not the official The Milestone Tree website. <a href=https://loader3229.github.io/milestone-tree>Jump to official The Milestone Tree website</a>";
	if(document.location.href.indexOf("127.0.0.1")!=-1)displayThings[2]=window.cnItems?"这是开发中的里程碑之树版本":"This is the developer version of The Milestone Tree";
}

if(document.location.href.indexOf("file:")!=-1)document.location.replace("https://127.0.0.1:60001/index2.html");