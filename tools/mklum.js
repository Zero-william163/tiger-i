const fs = require('fs');
const view = process.argv[2] || 'rl62';
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/lumcheck.html';
let c = fs.readFileSync(src, 'utf8');
c = c.replace('<div id="loading-screen"', '<div id="loading-screen" style="display:none!important"');
c = c.replace('</body>', String.raw`
<script>
(function(){
  var a = window.__app, T = THREE;
  a.loop = function(){}; a.state.auto = false; a.follow = false;
  a.state.tur=0; a.state.turT=0; a.state.ele=0; a.state.eleT=0;
  a.turret.rotation.y=0; a.gunPivot.rotation.x=0;
  a.root.rotation.set(0,0,0); a.root.position.set(0,0,0);
  a.parts.turret.position.copy(a.orig.turret); a.parts.hull.position.copy(a.orig.hull);
  var cam = {
    rl62: { p:[-1.221, 6.591, -2.114], t:[0, 2, 0] },
    fr62: { p:[1.221, 6.591, 2.114],  t:[0, 2, 0] }
  }['` + view + `'];
  a.camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
  a.oc.target.set(cam.t[0], cam.t[1], cam.t[2]); a.oc.update();
  a.camera.aspect = 900/600; a.camera.updateProjectionMatrix();
  a.renderer.setSize(900,600,false); a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  a.renderer.render(a.scene, a.camera);
  var W=900,H=600, gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
  function lum(i){ return 0.299*px[i]+0.587*px[i+1]+0.114*px[i+2]; }
  var hist=new Array(26).fill(0), sum=0, mx=0, mn=999;
  for (var i=0;i<px.length;i+=4){
    var L=lum(i); sum+=L; if(L>mx)mx=L; if(L<mn)mn=L;
    hist[Math.min(25,(L/10)|0)]++;
  }
  /* 定点采样: 对若干目标点做射线, 报渲染亮度+对象+世界法线 */
  var rc=new T.Raycaster();
  var targets=[
    ['deckFR', 1.40,1.831,1.60], ['deckFL', -1.40,1.831,1.60],
    ['deckRL', -1.40,1.831,-1.60], ['deckRR', 1.40,1.831,-1.60],
    ['roofTop', 0,2.66,0.2], ['wallRL', -0.94,2.2,-0.55], ['wallRR', 0.94,2.2,-0.55],
    ['plateN', 0,1.843,1.02], ['plateS', 0,1.843,-1.02], ['plateE', 1.02,1.843,0],
    ['plateRL', -1.02,1.843,-0.6], ['plateRR', 1.02,1.843,-0.6],
    ['wRRb', 0.94,1.95,-0.55], ['wRRc', 0.94,1.88,-0.55], ['wRRd', 0.94,2.45,-0.55],
    ['wRRe', 0.94,2.2,-0.85], ['wRRf', 0.94,2.2,-0.2], ['wRRg', 0.94,2.2,0.4]
  ];
  var samples=[];
  targets.forEach(function(tt){
   try{
    var tp=new T.Vector3(tt[1],tt[2],tt[3]);
    var dir=tp.clone().sub(a.camera.position).normalize();
    rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length){ samples.push({t:tt[0],miss:1}); return; }
    var p=hs[0].point;
    var ndc=p.clone().project(a.camera);
    var sx=((ndc.x+1)/2*(W-1))|0, sy=((ndc.y+1)/2*(H-1))|0;
    sx=Math.max(0,Math.min(W-1,sx)); sy=Math.max(0,Math.min(H-1,sy));
    var L=lum((sy*W+sx)*4);
    var o=hs[0].object, nm=(o.material&&o.material.color)?o.material.color.getHexString():'?';
    var wn=null;
    if (hs[0].face){
      var fa=hs[0].face, pa=o.geometry.attributes.position;
      var va=new T.Vector3().fromBufferAttribute(pa,fa.a).applyMatrix4(o.matrixWorld);
      var vb=new T.Vector3().fromBufferAttribute(pa,fa.b).applyMatrix4(o.matrixWorld);
      var vc=new T.Vector3().fromBufferAttribute(pa,fa.c).applyMatrix4(o.matrixWorld);
      wn=new T.Vector3().subVectors(vb,va).cross(new T.Vector3().subVectors(vc,va)).normalize();
    }
    samples.push({t:tt[0], lum:+L.toFixed(0), mat:nm,
      p:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)],
      n: wn?[+wn.x.toFixed(2),+wn.y.toFixed(2),+wn.z.toFixed(2)]:null});
   }catch(e){ samples.push({t:tt[0],err:String(e.message)}); }
  });
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify({view:'` + view + `', mn:+mn.toFixed(0), mx:+mx.toFixed(0), mean:+(sum/(W*H)).toFixed(0),
    hist:hist.map(function(h,i){return i*10+'-'+(i*10+9)+':'+h;}), samples:samples});
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('lumcheck view=' + view);
