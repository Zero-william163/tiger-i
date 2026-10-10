// 逐灯测试: 关掉其他灯, 单灯点亮, 看远壁背面像素响应 (判定各灯 NdotL 符号)
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/lightcheck.html';
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
  a.camera.aspect = 900/600; a.camera.updateProjectionMatrix();
  a.renderer.setSize(900,600,false); a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  a.camera.updateMatrixWorld(true); /* 刷新 matrixWorldInverse, 否则 project() 用旧矩阵 */
  var W=900,H=600, gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4);
  function snap(){ a.renderer.render(a.scene, a.camera); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px); }
  function rgbAt(x,y){ var i=(y*W+x)*4; return [px[i],px[i+1],px[i+2]]; }
  function lumAt(x,y){ var r=rgbAt(x,y); return 0.299*r[0]+0.587*r[1]+0.114*r[2]; }
  var rc=new T.Raycaster();
  function findPx(w,x,y,z){
    var tp=new T.Vector3(x,y,z);
    var dir=tp.clone().sub(a.camera.position).normalize();
    rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length) return null;
    var ndc=hs[0].point.clone().project(a.camera);
    var sx=((ndc.x+1)/2*(W-1))|0, sy=((ndc.y+1)/2*(H-1))|0;
    return {x:sx, y:sy};
  }
  var dirLights=[], hemi=null;
  a.scene.traverse(function(o){
    if (o.isDirectionalLight) dirLights.push(o);
    if (o.isHemisphereLight) hemi=o;
  });
  function tag(l){
    var p=l.position;
    if (p.x>5&&p.y>10) return 'sun';
    if (p.x<-5&&p.y>5&&p.z<-5&&p.y<9) return 'fill';
    if (p.x<0&&p.z<-10) return 'rim';
    return 'bounce';
  }
  var farPx=findPx('far',0.94,2.20,-0.55);
  var nearPx=findPx('near',-0.94,2.20,-0.55);
  var out=[];
  function measure(name, keep){
    dirLights.forEach(function(l){ l.intensity = (tag(l)===keep)? l.userData.base : 0; });
    snap();
    out.push({c:name, far:Math.round(lumAt(farPx.x,farPx.y)), near:Math.round(lumAt(nearPx.x,nearPx.y)),
      farRGB:rgbAt(farPx.x,farPx.y), nearRGB:rgbAt(nearPx.x,nearPx.y)});
  }
  dirLights.forEach(function(l){ l.userData.base=l.intensity; });
  var tests=['all','sun','fill','rim','bounce','none'];
  tests.forEach(function(t){
    dirLights.forEach(function(l){ l.intensity = (t==='all'||tag(l)===t)? l.userData.base : 0; });
    snap();
    out.push({c:t==='all'?'all':t==='none'?'hemiOnly':t+'Only',
      far:Math.round(lumAt(farPx.x,farPx.y)), near:Math.round(lumAt(nearPx.x,nearPx.y)),
      farRGB:rgbAt(farPx.x,farPx.y), nearRGB:rgbAt(nearPx.x,nearPx.y)});
  });
  dirLights.forEach(function(l){ l.intensity=l.userData.base; });
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify({farPx:farPx, nearPx:nearPx, lights:dirLights.map(tag), res:out});
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written lightcheck');
