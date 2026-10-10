const fs = require('fs');
const view = process.argv[2] || 'def';
const src = process.argv[3] || 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/darkcheck.html';
let c = fs.readFileSync(src, 'utf8');
c = c.replace('<div id="loading-screen"', '<div id="loading-screen" style="display:none!important"');
c = c.replace('</body>', String.raw`
<script>
(function(){
  var a = window.__app, T = THREE;
  a.loop = function(){}; a.state.auto = false; a.follow = false;
  var cam = {
    def:  { p:[8.2, 3.6, 7.6],  t:[0, 1.4, 0] },
    top:  { p:[0.001,12.0,0.001], t:[0, 1.85, 0] },
    rlhi: { p:[-5.0, 6.5, -5.0], t:[0, 1.9, 0] },
    rl62: { p:[-1.221, 6.591, -2.114], t:[0, 2, 0] },
    fr62: { p:[1.221, 6.591, 2.114], t:[0, 2, 0] }
  }['` + view + `'];
  a.camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
  a.oc.target.set(cam.t[0], cam.t[1], cam.t[2]); a.oc.update();
  a.camera.aspect = 900/600; a.camera.updateProjectionMatrix();
  a.renderer.setSize(900,600,false); a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  a.renderer.render(a.scene, a.camera);
  var W=900,H=600, gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
  var rc=new T.Raycaster(), dark=[];
  function lum(i){ return 0.299*px[i]+0.587*px[i+1]+0.114*px[i+2]; }
  for (var y=0;y<H;y+=2) for (var x=0;x<W;x+=2){
    var i=(y*W+x)*4, L=lum(i);
    if (L<62) dark.push([x,y,L]);
  }
  var agg={};
  for (var d=0;d<dark.length;d++){
    var dx=(dark[d][0]/(W-1))*2-1, dy=(dark[d][1]/(H-1))*2-1;
    rc.setFromCamera(new T.Vector2(dx,dy), a.camera);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length) continue;
    var o=hs[0].object, p=hs[0].point, n=hs[0].face?hs[0].normal:null;
    var nm=(o.material&&o.material.color)?o.material.color.getHexString():'?';
    var gk=nm+'|'+(o.geometry.type||'?').slice(0,9);
    if (n){ var wn=n.clone().transformDirection(o.matrixWorld);
      gk += '|n'+wn.x.toFixed(1)+','+wn.y.toFixed(1)+','+wn.z.toFixed(1); }
    var k=(o.name||'')+'|'+gk;
    if (!agg[k]) agg[k]={n:0, obj:gk, pts:[], lum:[]};
    var A=agg[k]; A.n++; A.lum.push(dark[d][2]);
    if (A.pts.length<6) A.pts.push([+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)]);
  }
  var out=[]; Object.keys(agg).forEach(function(k){ var A=agg[k];
    A.lum.sort(function(a,b){return a-b;});
    out.push({key:k, n:A.n, med:A.lum[A.lum.length>>1], pts:A.pts});
  });
  out.sort(function(a,b){return b.n-a.n;});
  var pre=document.createElement('pre'); pre.textContent='PROBE:'+JSON.stringify({view:'` + view + `', darkPx:dark.length, hits:out.slice(0,10)});
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('darkcheck view=' + view);
