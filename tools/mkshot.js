const fs = require('fs');
const view = process.argv[2] || 'top';
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/shot.html';
let c = fs.readFileSync(src, 'utf8');
c = c.replace('<div id="loading-screen"', '<div id="loading-screen" style="display:none!important"');
c = c.replace('</body>', String.raw`
<script>
(function(){
  var a = window.__app;
  a.loop = function(){};
  a.state.auto = false; a.follow = false;
  var cam = {
    top:   { p:[0.001, 12.0, 0.001], t:[0, 1.85, 0] },
    rl:    { p:[-6.5, 4.2, -6.5],    t:[0, 1.9, 0] },
    rlhi:  { p:[-5.0, 6.5, -5.0],    t:[0, 1.9, 0] },
    def:   { p:[8.2, 3.6, 7.6],      t:[0, 1.4, 0] },
    rear:  { p:[0.001, 4.5, -8.0],   t:[0, 1.9, 0] }
  }['` + view + `'];
  a.camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
  a.oc.target.set(cam.t[0], cam.t[1], cam.t[2]); a.oc.update();
  a.camera.aspect = 1200/800; a.camera.updateProjectionMatrix();
  a.scene.updateMatrixWorld(true);
  a.renderer.render(a.scene, a.camera);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('shot view=' + view);
