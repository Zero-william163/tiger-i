// 机制验证: 远壁背面为何只 ~47 (hemi-only)?
// 变体: base / fillX4 / noSunShadow / 都在 rl62 视角 (同 mklum)
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/fillcheck.html';
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
  var cam = { p:[-1.221, 6.591, -2.114], t:[0, 2, 0] };
  a.camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
  a.oc.target.set(cam.t[0], cam.t[1], cam.t[2]); a.oc.update();
  a.camera.aspect = 900/600; a.camera.updateProjectionMatrix();
  a.renderer.setSize(900,600,false); a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  var W=900,H=600, gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4);
  function snap(){ a.renderer.render(a.scene, a.camera); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px); }
  function lumAt(x,y){ var i=((y*W+x)*4); return 0.299*px[i]+0.587*px[i+1]+0.114*px[i+2]; }
  function ndcOf(p){ var v=p.clone().project(a.camera); return [((v.x+1)/2*(W-1))|0, ((v.y+1)/2*(H-1))|0]; }
  var rc=new T.Raycaster();
  function sample(w,x,y,z){
    var tp=new T.Vector3(x,y,z);
    var dir=tp.clone().sub(a.camera.position).normalize();
    rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length) return {miss:1};
    var s=ndcOf(hs[0].point);
    return { lum: Math.round(lumAt(s[0],s[1])), p:[+hs[0].point.x.toFixed(2),+hs[0].point.y.toFixed(2),+hs[0].point.z.toFixed(2)] };
  }
  var fill=null, sun=null;
  a.scene.traverse(function(o){
    if (o.isDirectionalLight) {
      var p=o.position;
      if (p.x<-5 && p.z<-5 && p.y<8) fill=o;
      if (p.x>5 && p.y>10) sun=o;
    }
  });
  var out=[];
  function measure(tag){
    snap();
    out.push({tag:tag, far: sample('far',0.94,2.20,-0.55), near: sample('near',-0.94,2.20,-0.55), roof: sample('roof',0.01,2.63,0.22)});
  }
  measure('base');
  if (fill){ fill.intensity=4.0; measure('fillX4'); fill.intensity=0.95; }
  if (sun){ sun.castShadow=false; measure('noSunShadow'); sun.castShadow=true; }
  if (sun && fill){ sun.castShadow=false; fill.intensity=4.0; measure('both'); }
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify({lightsFound:{fill:!!fill,sun:!!sun}, res:out});
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written fillcheck');
