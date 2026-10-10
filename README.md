# 虎式 I 型重型坦克（后期生产型）三维数字复原

双端（PC / 手机）WebGL 数字展台。**单文件应用**：three.js r128 全部内联，装甲迷彩与地面纹理由代码生成的 Canvas 纹理绘制，零外部依赖、无网络请求 —— 放进任意静态托管即可运行。

## 在线地址

**https://zero-william163.github.io/tiger-i/**

## 仓库结构

```
tiger-i/
├── index.html          # 发布用页面（GitHub Pages 首页，与 tiger_i_3d.html 内容一致）
├── tiger_i_3d.html     # 主源文件（工作副本，所有修改都做在这里）
├── tools/              # 开发期使用的无头浏览器验证探针（Node 生成探针页 + Chrome 抓取 PROBE 输出）
│   ├── mkinit.js       # 同步初始化探针：错误屏 / ready / 首帧渲染
│   ├── mkrun.js        # 延时初始化探针（读取最终加载状态文案）
│   ├── mklum.js        # 亮度采样探针：直方图 + 定点亮度/材质/世界法线
│   ├── mkdark.js       # 暗像素探针：统计 lum<62 区域并反查所属对象
│   ├── mkmobile.js     # 双端档位探针：mobile 判定 / 像素比 / 阴影贴图 / 阴影类型
│   ├── mkshot.js       # 截图生成器
│   ├── verify.js       # 结构自检（23 项）+ 乱码字符扫描
│   └── mkfill.js / mklights.js / mknormal.js / mkdiag.js
│                      # 灯光响应 / 插值法线 / 像素反射线 诊断探针
└── README.md
```

## 操作

- **PC**：左键拖拽环绕视角、滚轮缩放；W/S 行驶、A/D 转向、Shift 加速；Q/E 炮塔旋转、R/F 俯仰、空格开火。
- **手机**：单指旋转视角、双指捏合缩放；底部按钮驾驶 / 自动旋转 / 结构模式 / 爆炸视图；左侧按钮一键视角。
- 右上角「技术参数」查看完整数据；左侧「结构」切换部件显示。

## 双端性能档位

页面自动判定档位（移动 UA，或触屏且窄窗 → 低档）：

| 档位 | 像素比上限 | 阴影类型 | 阴影贴图 |
|---|---|---|---|
| 手机 | 1.5（dpr=3 时封顶） | PCF | 1024×1024 |
| 桌面 | 2 | PCFSoft | 2048×2048 |

## 如何更新线上页面

1. 修改 `tiger_i_3d.html`；
2. 复制一份改名为 `index.html`（内容保持一致），放到仓库 `main` 分支**根目录**；
3. GitHub 仓库页 **Add file → Upload files** 覆盖上传，或 `git push`；
4. GitHub Pages 自动重建，约 1 分钟生效。

## 验证方式（无头浏览器）

以 `mklum.js` 为例：

```powershell
node tools/mklum.js rl62
chrome --headless=new --enable-unsafe-swiftshader --use-angle=swiftshader `
      --no-sandbox --disable-gpu --virtual-time-budget=30000 `
      --dump-dom "file:///.../shot/lumcheck.html" | Select-String '<pre>PROBE:'
```

探针会在 `</body>` 前同步注入、渲染一帧并把 `PROBE:{...}` 写入 `<pre>`，便于断言亮度、暗像素数、渲染档位与初始化状态。