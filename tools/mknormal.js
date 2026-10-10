// 测远壁背面片元的平滑着色法线: 从远壁像素反投影射线, 取命中三角形,
// 用重心坐标插值顶点法线, 得到 fragment shader 使用的 vNormal(翻转前)
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/normalcheck.html';
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
  a.camera.updateMatrixWorld(true);
  function rayAt(w,x,y,z){
    var tp=new T.Vector3(x,y,z);
    var dir=tp.clone().sub(a.camera.position).normalize();
    var rc=new T.Raycaster(); rc.set(a.camera.position, dir);
    var hs=rc.intersectObject(a.root,true);
    if (!hs.length) return {miss:1};
    return {hit:hs[0]};
  }
  function interpolateNormal(h){
    var o=h.object, g=o.geometry, f=h.face;
    if (!g.attributes.normal || !f) return null;
    var pa=g.attributes.position, na=g.attributes.normal;
    var A=new T.Vector3().fromBufferAttribute(pa,f.a).applyMatrix4(o.matrixWorld);
    var B=new T.Vector3().fromBufferAttribute(pa,f.b).applyMatrix4(o.matrixWorld);
    var C=new T.Vector3().fromBufferAttribute(pa,f.c).applyMatrix4(o.matrixWorld);
    var P=h.point;
    // 计算重心坐标
    var v0=new T.Vector3().subVectors(B,A), v1=new T.Vector3().subVectors(C,A), v2=new T.Vector3().subVectors(P,A);
    var d00=v0.dot(v0), d01=v0.dot(v1), d11=v1.dot(v1), d20=v2.dot(v0), d21=v2.dot(v1);
    var denom=d00*d11-d01*d01;
    var v=(d11*d20-d01*d21)/denom, w=(d00*d21-d01*d20)/denom, u=1-v-w;
    var nm=new T.Matrix3().getNormalMatrix(o.matrixWorld);
    var nA=new T.Vector3().fromBufferAttribute(na,f.a).applyMatrix3(nm).normalize();
    var nB=new T.Vector3().fromBufferAttribute(na,f.b).applyMatrix3(nm).normalize();
    var nC=new T.Vector3().fromBufferAttribute(na,f.c).applyMatrix3(nm).normalize();
    var n=new T.Vector3().addScaledVector(nA,u).addScaledVector(nB,v).addScaledVector(nC,w).normalize();
    return {n:n, u:+u.toFixed(3), v:+v.toFixed(3), w:+w.toFixed(3),
      nA:[''+nA.x.toFixed(2),''+nA.y.toFixed(2),''+nA.z.toFixed(2)],
      nB:[''+nB.x.toFixed(2),''+nB.y.toFixed(2),''+nB.z.toFixed(2)],
      nC:[''+nC.x.toFixed(2),''+nC.y.toFixed(2),''+nC.z.toFixed(2)]};
  }
  var pts=[['far_mid',0.94,2.20,-0.55],['far_top',0.94,2.50,-0.55],['far_low',0.94,1.95,-0.55],
           ['near_mid',-0.94,2.20,-0.55],['roof',0.01,2.63,0.22]];
  var out=[];
  pts.forEach(function(p){
    var r=rayAt(p[0],p[1],p[2],p[3]);
    if (r.miss){ out.push({t:p[0],miss:1}); return; }
    var h=r.hit, o=h.object;
    var mat=(o.material&&o.material.color)?'0x'+o.material.color.getHexString():'?';
    var ndc=h.point.clone().project(a.camera);
    out.push({t:p[0], hit:[''+h.point.x.toFixed(2),''+h.point.y.toFixed(2),''+h.point.z.toFixed(2)],
      mat:mat, geo:[''+o.geometry.uuid], interp:interpolateNormal(h),
      face:[''+h.face.a,''+h.face.b,''+h.face.c]});
  });
  var pre=document.createElement('pre');
  pre.textContent='PROBE:'+JSON.stringify(out);
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written normalcheck');