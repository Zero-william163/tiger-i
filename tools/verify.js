const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/Desktop/new1/tiger_i_3d.html', 'utf8');
const lines = c.split('\n');

/* ---- 工具: 判断某行中 code 片段是否在注释外 ---- */
function codeBefore(line, idx){   // idx: 关键词位置; 返回该位置之前是否有未闭合的 // 或 /* */
  const before = line.slice(0, idx);
  const li = before.lastIndexOf('//');
  const bi = before.lastIndexOf('/*');
  const bclose = before.lastIndexOf('*/');
  if (li >= 0) return false;                       // 行内有 // 在前面 → 在行注释里
  if (bi >= 0 && bi > bclose) return false;        // 行内有未闭合 /* → 在块注释里
  return true;
}

function findLine(re, label){
  for (let i = 0; i < lines.length; i++){
    const idx = lines[i].search(re);
    if (idx >= 0) return { line: i+1, idx, ok: codeBefore(lines[i], idx), text: lines[i].trim().slice(0, 100) };
  }
  return { line: -1, ok: false, text: '(not found) ' + label };
}

const checks = [
  [/const L = \{/, 'L 对象'],
  [/trackW:\s*0\.705/, 'trackW'],
  [/trackBot:\s*0\.055/, 'trackBot'],
  [/endR:\s*0\.6175/, 'endR'],
  [/endY:\s*0\.6725/, 'endY'],
  [/hullHW:\s*1\.780/, 'hullHW'],
  [/deckY:\s*1\.000/, 'deckY'],
  [/noseLowZ:\s*3\.030/, 'noseLowZ'],
  [/tailZ:\s*-3\.170/, 'tailZ'],
  [/gunY:\s*2\.225/, 'gunY'],
  [/gunL:\s*4\.05/, 'gunL'],
  [/armorDark\(\)\{/, 'armorDark 方法'],
  [/armorLight\(\)\{/, 'armorLight 方法'],
  [/const zt = -Rb \+ 0\.13/, 'const zt'],
  [/const zR = -0\.925/, 'const zR'],
  [/const F = 0\.0/, 'const F'],
  [/const cz = \(zb \+ zi\)\/2/, 'const cz'],
  [/const rg = new THREE\.Group\(\); rg\.position\.set\(s\*L\.trackX, L\.rollerY/, 'const rg 托带轮'],
  [/const ROUT = 1\.10/, '座圈盖板 ROUT'],
  [/plate = cyl\(ROUT, ROUT, 0\.024, 64, A\)/, '盖板几何'],
  [/this\.g\.add\(plate\)/, '盖板加入场景'],
  [/boltRing\(this\.g, 48, 1\.062/, '盖板螺栓'],
  [/DirectionalLight\(0xb7cae0, 0\.60\)/, '补光 bounce'],
];
let pass = 0, fail = 0;
for (const [re, label] of checks){
  const r = findLine(re, label);
  const ok = r.line > 0 && r.ok;
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (r.line > 0 ? '  @' + r.line : '') + (ok ? '' : '  << ' + r.text));
}
console.log('---- pass=' + pass + ' fail=' + fail);

/* ---- 可见字符串残留 U+FFFD 检查: HTML 区 + 脚本字符串字面量 ---- */
const scriptStart = c.indexOf("'use strict';", c.indexOf('<body>'));
const htmlPart = c.slice(0, c.indexOf('</head>'));
let visBad = 0;
htmlPart.split('\n').forEach((l, i) => {
  const t = l.replace(/\/\*[\s\S]*?\*\//g, '');       // 去掉 CSS 注释
  if (t.indexOf('\uFFFD') >= 0){ visBad++; console.log('HTML-VIS ' + (i+1) + ': ' + l.trim().slice(0, 90)); }
});
/* 脚本中的字符串字面量(简单状态机) */
const s = c.slice(scriptStart);
let st = 'code', cur = '', bad = 0, ln = 1;
for (let i = 0; i < s.length; i++){
  const ch = s[i];
  if (ch === '\n') { if (st === 's1' || st === 's2') { /* 跨行字符串 */ } ln++; }
  if (st === 'code'){ if (ch === "'") { st = 's1'; cur = ''; } else if (ch === '"') { st = 's2'; cur = ''; } else if (ch === '/' && s[i+1] === '/') { st = 'lc'; i++; } else if (ch === '/' && s[i+1] === '*') { st = 'bc'; i++; } }
  else if (st === 's1' || st === 's2'){
    if (ch === '\\') { cur += ch + (s[i+1]||''); i++; }
    else if ((st==='s1'&&ch==="'")||(st==='s2'&&ch==='"')) {
      if (cur.indexOf('\uFFFD') >= 0){ bad++; console.log('JS-STR ~' + ln + ': ' + cur.replace(/\uFFFD/g,'<U+FFFD>').slice(0,80)); }
      st = 'code';
    }
    else cur += ch;
  }
  else if (st === 'lc'){ if (ch === '\n') st = 'code'; }
  else if (st === 'bc'){ if (ch === '*' && s[i+1] === '/') { st = 'code'; i++; } }
}
console.log('script strings with FFFD: ' + bad + '; html visible with FFFD: ' + visBad);
