// 移动端性能档位 + 渲染验证探针
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/mocheck.html';
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
  a.camera.position.set(-1.221, 6.591, -2.114);
  a.oc.target.set(0, 2, 0); a.oc.update();
  var W=390, H=644;  /* 模拟移动视口内画布(不与 dpr 相乘, dpr 由设备模拟) */
  a.camera.aspect = W/H; a.camera.updateProjectionMatrix();
  a.renderer.setSize(W,H,false); a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  a.renderer.render(a.scene, a.camera);
  var gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
  var rc=new T.Raycaster(), sum=0, mn=999, mx=0, dark=0;
  for (var i=0;i<px.length;i+=4){
    var L=0.299*px[i]+0.587*px[i+1]+0.114*px[i+2]; sum+=L;
    if(L>mx)mx=L; if(L<mn)mn=L; if(L<62) dark++;
  }
  function lumAt(x,y){ var j=(y*W+x)*4; return Math.round(0.299*px[j]+0.587*px[j+1]+0.114*px[j+2]); }
  function sample(w,x,y,z){
    var tp=new T.Vector3(x,y,z);
    var dir=tp.clone().sub(a.camera.position).normalize();
    rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length) return {miss:1};
    var ndc=hs[0].point.clone().project(a.camera);
    var sx=Math.max(0,Math.min(W-1,((ndc.x+1)/2*(W-1))|0));
    var sy=Math.max(0,Math.min(H-1,((ndc.y+1)/2*(H-1))|0));
    return {lum:lumAt(sx,sy)};
  }
  /* 档位信息 */
  var sun=null;
  a.scene.traverse(function(o){ if (o.isDirectionalLight && o.castShadow) sun=o; });
  var out = {
    mobile: !!a.mobile,
    dprCap: Math.min(devicePixelRatio, a.mobile?1.5:2),
    devicePixelRatio: devicePixelRatio,
    pixelRatio: a.renderer.getPixelRatio(),
    shadowType: a.renderer.shadowMap.type===T.PCFSoftShadowMap?'PCFSoft':a.renderer.shadowMap.type===T.PCFShadowMap?'PCF':'other',
    shadowMapSize: sun ? sun.shadow.mapSize.x : null,
    antialias: a.renderer.getContext().getContextAttributes().antialias,
    vw: innerWidth, vh: innerHeight,
    darkPx: dark, mean: Math.round(sum/(W*H)), mn: Math.round(mn), mx: Math.round(mx),
    farWall: sample('fw',0.94,2.20,-0.55), nearWall: sample('nw',-0.94,2.20,-0.55)
  };
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify(out);
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written mocheck');