(function(){
  // MIRROR of NewDocs/plans/tmt/probes/buyable-currency-from-buy-source.js (planner, 2026-09-19), kept byte-for-byte in
  // its logic so a gate can name the instrument it quotes. C1b (brief tmt-auto-20, Q8): the `isNaN(id)` skip is DROPPED
  // (the object test already excludes rows / cols / respec / layer), and `word` tallies the WORD-id buyables apart, so
  // the frozen numeric-id controls stay what they measured and the word ids get their own dated control.
  // Run: node tools/harness/run.mjs <id> --ticks 1 --no-automation --eval "$(cat tools/harness/probe-buyable-currency.js)"
  var DEC=/(player(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])+)\s*=\s*\1\s*\.\s*(sub|minus|subtract)\s*\(/g;
  var out={buyables:0,nobuy:0,found:0,none:0,multi:0,own:0,other:0,rows:[],word:{buyables:0,nobuy:0,found:0,none:0,multi:0,own:0,other:0}};
  for (var l in layers){ var B=layers[l]&&layers[l].buyables; if(!B) continue;
    for (var id in B){ if(!B[id]||typeof B[id]!=='object'||Array.isArray(B[id])) continue; var W=isNaN(id)?out.word:null; out.buyables++; if(W) W.buyables++;
      var f=B[id].buy; if(typeof f!=='function'){out.nobuy++; if(W) W.nobuy++; continue;}
      var src=f.toString(), m, set={}; DEC.lastIndex=0;
      while((m=DEC.exec(src))) set[m[1].replace(/\s+/g,'')]=1;
      var t=Object.keys(set);
      if(!t.length){out.none++; if(W) W.none++; if(out.rows.length<40) out.rows.push([l,id,'NONE']); continue;}
      if(t.length>1){out.multi++; if(W) W.multi++; out.rows.push([l,id,'MULTI',t]); continue;}
      out.found++; if(W) W.found++;
      var norm=t[0].replace(/\[this\.layer\]/g,'.'+l).replace(/\[["']([\w$]+)["']\]/g,'.$1');
      if(norm==='player.'+l+'.points'){ out.own++; if(W) W.own++; } else {out.other++; if(W) W.other++; out.rows.push([l,id,norm]);}
    } }
  return JSON.stringify(out);
})()
