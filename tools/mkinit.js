// 同步初始化探针: 仿照 mklum 的同步执行方式, 不依赖 setTimeout/虚拟时间
const fs = require('fs');
const src = 'C:/Users/Administrator/Desktop/new1/tiger_i_3d.html';
const dst = 'C:/Users/Administrator/Desktop/new1/shot/initcheck.html';
let c = fs.readFileSync(src, 'utf8');
c = c.replace('<div id="loading-screen"', '<div id="loading-screen" style="display:none!important"');
c = c.replace('</body>', String.raw`
<script>
(function(){
  var out = {};
  try {
    var es = document.getElementById('error-screen');
    var ed = document.getElementById('error-detail');
    out.errShown = es ? (es.style.display === 'flex') : null;
    out.errText = ed ? (ed.textContent||'').slice(0,120) : '(no el)';
    out.ready = !!window.__tigerReady;
    out.hasApp = !!window.__app;
    out.loadStatus = (document.getElementById('loading-status')||{}).textContent || null;
    out.enterBtn = !!document.getElementById('enter-btn');
    if (window.__app){
      var a = window.__app;
      a.loop = function(){};
      out.hasScene = !!a.scene;
      out.sceneChildren = a.scene ? a.scene.children.length : -1;
      out.hasRenderer = !!a.renderer;
      out.camPos = a.camera ? [a.camera.position.x.toFixed(2), a.camera.position.y.toFixed(2), a.camera.position.z.toFixed(2)] : null;
      a.renderer.render(a.scene, a.camera);
      out.renderedOk = true;
    }
  } catch(e){ out.exc = String(e && e.message || e); }
  var pre = document.createElement('pre');
  pre.textContent = 'PROBE:' + JSON.stringify(out);
  document.body.appendChild(pre);
})();
</script>
</body>`);
fs.writeFileSync(dst, c);
console.log('written initcheck');