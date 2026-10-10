const fs = require('fs');
const path = require('path');
const root = 'C:/Users/Administrator/Desktop/new1';
let html = fs.readFileSync(path.join(root, 'tiger_i_3d.html'), 'utf8');

const probe = `
<script>
setTimeout(function(){
  const out = document.getElementById('probe-out');
  if (!out) return;
  let info = {};
  try {
    const es = document.getElementById('error-screen');
    const ed = document.getElementById('error-detail');
    info.errShown = es && es.style.display === 'flex';
    info.errText = ed ? ed.textContent : '(no el)';
    info.ready = !!window.__tigerReady;
    info.hasApp = !!window.__app;
    info.loadStatus = (document.getElementById('loading-status')||{}).textContent;
    info.enterShown = document.getElementById('enter-btn').className;
  } catch(e) { info.exc = String(e && e.message || e); }
  out.textContent = 'PROBE:' + JSON.stringify(info);
}, 5200);
</script>
<div id="probe-out" style="position:fixed;left:0;top:0;z-index:99999;background:#000;color:#0f0;font:11px monospace;white-space:pre-wrap;max-width:100%">PROBE:pending</div>
`;

html = html.replace('</body>', probe + '</body>');
fs.writeFileSync(path.join(root, 'shot', 'runcheck.html'), html, 'utf8');
console.log('written');
