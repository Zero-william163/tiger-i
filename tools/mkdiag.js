// 像素级反射线诊断: 每个暗像素反推是"谁"渲染出来的 (对象+世界法线+位置)
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/diagcheck.html';
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
  var W=900,H=600, gl=a.renderer.getContext();
  var px=new Uint8Array(W*H*4);
  a.renderer.render(a.scene, a.camera);
  gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
  function lumAt(x,y){ var i=(y*W+x)*4; return 0.299*px[i]+0.587*px[i+1]+0.114*px[i+2]; }
  var rc=new T.Raycaster();
  rc.near=0.1;
  var inv=new T.Matrix4();
  var buckets={}, total=0;
  function classify(x,y){
    var L=lumAt(x,y);
    var ndc=new T.Vector2((x/(W-1))*2-1, (y/(H-1))*2-1);
    var p=new T.Vector3(ndc.x, ndc.y, 0.5).unproject(a.camera);
    var dir=p.sub(a.camera.position).normalize();
    rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root, true);
    if (!hs.length) return null;
    var h=hs[0], o=h.object;
    var mat=(o.material&&o.material.color)?('0x'+o.material.color.getHexString()):'?';
    var nm=[0,0,0];
    if (h.face){
      var pa=o.geometry.attributes.position;
      var va=new T.Vector3().fromBufferAttribute(pa,h.face.a).applyMatrix4(o.matrixWorld);
      var vb=new T.Vector3().fromBufferAttribute(pa,h.face.b).applyMatrix4(o.matrixWorld);
      var vc=new T.Vector3().fromBufferAttribute(pa,h.face.c).applyMatrix4(o.matrixWorld);
      nm=new T.Vector3().subVectors(vb,va).cross(new T.Vector3().subVectors(vc,va)).normalize();
    }
    var key=mat+'|n('+(nm.x>=0.6?'+x':nm.x<=-0.6?'-x':Math.abs(nm.x)<=0.4?(nm.y>=0.6?'+y':nm.y<=-0.6?'-y':'±y'):(nm.z>=0.6?'+z':'-z'))+')'
      +'|p('+(Math.round(h.point.x*2)/2)+','+(Math.round(h.point.y*2)/2)+','+(Math.round(h.point.z*2)/2)+')';
    if (!buckets[key]) buckets[key]={n:0, lumSum:0};
    buckets[key].n++; buckets[key].lumSum+=L;
    return L;
  }
  /* 只在炮塔基部环带区域统计: 屏幕区域 y∈[100,540], 全宽, 步进5, 上限4000条 */
  var cnt={dark:0, mid:0, bright:0};
  var budget=4000;
  for (var y=100;y<540;y+=5){
    for (var x=0;x<W;x+=5){
      var L=lumAt(x,y);
      if (L<100) cnt.dark++; else if (L<180) cnt.mid++; else cnt.bright++;
      var doCls = (L<100 && budget>0) || (L>=100 && L<180 && budget>0 && ((x+y)%3===0));
      if (doCls){ if (classify(x,y)===null) cnt.miss=(cnt.miss||0)+1; budget--; }
    }
  }
  var top=Object.keys(buckets).map(function(k){ return {k:k, n:buckets[k].n, lum:Math.round(buckets[k].lumSum/buckets[k].n)}; })
    .sort(function(a,b){return b.n-a.n;}).slice(0,14);
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify({cnt:cnt, top:top});
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written diagcheck');
