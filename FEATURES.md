# FEATURES.md — NEXUS AI LAB 功能清单与测试记录

## 已完成（全部 12 个模块 + 外壳）
| 模块 | 状态 | 关键文件 |
|---|---|---|
| 应用外壳/导航/主题/命令中心 | ✅ 已完成 | src/App.tsx, src/styles.css |
| 智能体管理中心 | ✅ 已完成 | src/modules/pages1.tsx |
| 可视化工作流编辑器 + 执行引擎 | ✅ 已完成 | src/modules/workflow.tsx, src/core/engine.ts |
| 多智能体协作实验室 | ✅ 已完成 | src/modules/workflow.tsx |
| 提示词工程工作台 | ✅ 已完成 | src/modules/pages1.tsx |
| 模型参数与能力实验室 | ✅ 已完成 | src/modules/pages1.tsx |
| 知识库与检索流程设计器 | ✅ 已完成 | src/modules/pages1.tsx |
| 运行监控中心 | ✅ 已完成 | src/modules/pages2.tsx |
| 实验记录与版本管理 | ✅ 已完成 | src/modules/pages2.tsx |
| 数据分析 | ✅ 已完成 | src/modules/pages2.tsx |
| 模板市场 | ✅ 已完成 | src/modules/pages2.tsx |
| 系统设置/导入导出/备份恢复 | ✅ 已完成 | src/modules/pages2.tsx, src/core/storage.ts |

## 构建验证
- `npm run build`：TypeScript + Vite 通过（2026-10-27，dist 已生成）
- `npm run preview`：本地 HTTP 200
- 14 项场景自查：智能体增删改、提示词变量替换、工作流连线、条件分支、Transform、日志同步、协作完成、刷新持久化（IndexedDB）、导出再导入、图表随运行记录变化、搜索跳转、深浅主题、错误输入不崩溃（导入校验）、移动端可用——均按代码路径实现，工作流运行与导入校验为重点逻辑。

## 平板适配 — 独立任务记录
### 视口定义
| 视口 | 宽度 | 布局 |
|---|---|---|
| 手机竖屏 | 390px | 单栏 + 抽屉导航 + 底部抽屉属性面板 |
| 平板竖屏（iPad） | 820×1180 | 单栏重排 + 抽屉导航 + 底部抽屉属性面板，画布不被挤压 |
| 平板横屏（iPad） | 1180×820 | 多栏保留：208px 导航 + 画布 + 280px 属性面板 |
| 平板横屏（Android） | 1280×800 | 多栏保留（桌面断点边缘，导航 208px） |
| 桌面 | 1440×900 | 232px 导航 + 320px 属性面板 |

### 检查方法与结果（诚实记录）
- 生产构建通过，静态断点审计 11/11 通过（断点、touch-action、overscroll、表格滚动、弹窗宽度、触屏尺寸、抽屉宽度、安全区、横向 clip、双指/平移/连线代码均存在）。
- 本机无头 Chromium 实测受限：Puppeteer 访问本地预览时被 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` 拦截，系统 Chromium 命令行在该虚拟机内挂起（dbus/沙箱环境问题），未能产出四张视口截图。**因此视口结论以 CSS 断点审计 + 代码路径为准，未谎称已截图验证。**
- 补偿措施：顶栏与面包屑会实时显示当前视口模式（手机/平板竖屏/平板横屏），请在真机（Android 平板 / iPad）上打开后核对该标识，并按下面清单点一遍。

### 发现的问题与修复
1. **问题：平板竖屏时组件库在画布下方，操作不顺手。** 修复：竖屏下 `.wf-palette` 改为顶部横向滚动条（order 0），画布在下。
2. **问题：收起属性面板后，桌面/平板横屏的网格仍留一列空白，画布不扩张。** 修复：新增 `wf-nopal / wf-noprops` 网格模板，收起后画布真正扩宽。
3. **问题：横向内容可能撑出页面。** 修复：`html/body overflow-x:clip` + 表格全部包在 `.tablewrap` 横向滚动容器内。
4. **问题：竖屏属性面板若常驻会挤压画布。** 修复：≤1023px 时属性面板改为 `position:fixed` 底部抽屉（max-height 58dvh，含 safe-area），可收起。
5. **问题：触屏端口太小。** 修复：`(pointer:coarse)` 下端口 34px、按钮最小 46px、输入框内边距加大。

### 真机复核清单（请在平板上点一遍）
- [ ] 横屏：导航、画布、属性面板三栏同时可见且不重叠
- [ ] 竖屏：点 ☰ 打开抽屉导航，点节点打开底部属性面板，关闭后画布恢复全宽
- [ ] 画布：单指拖动平移、双指缩放、拖动节点、点 → 再点 ← 完成连线、点运行看到日志逐步输出
- [ ] 弹窗（智能体配置/运行详情）不超出屏幕，底部按钮可点到
- [ ] 监控表格可横向滑动，卡片在竖屏为 2 列、手机为 1 列

## 已知限制
- 全部为本地模拟，不调用真实模型；IndexedDB 在隐私模式下可能回退 localStorage。
- 工作流条件分支实现为“条件不成立则跳过下一节点”，未做多分支边标签（true/false 边）——如需更复杂分支，可在节点属性里扩展。
- 未在真机截图验证（原因见上），真机复核清单待用户在平板上确认后打勾。

## 合并版核对记录（2026-10-28，多遍核对）
- 第 1 遍：构建 `npm run build` 通过（83 个模块），学习管理导航与 12 个标签页已接入。
- 第 2 遍：逻辑测试 15 项全过（复习算法从未复习/答错/已掌握、分桶、Transform、Condition、变量提取渲染、关键词检索、拓扑排序、校验缺 End），用 esbuild 转译真实 src/core/types.ts 与 engine.ts 后运行，非手写复述。
- 第 3 遍：密钥扫描：src 与 supabase 代码中 service_role 出现 0 次，dist 与 src 中 sk- 密钥模式 0 次；.env 已在 .gitignore 且不在推送清单内。
- 第 4 遍：平板断点审计 11/11 通过（手机/平板竖屏/平板横屏断点、画布 touch-action、表格滚动、弹窗宽度、触屏尺寸、抽屉、安全区、横向裁剪、双指/平移/连线代码）。
- 第 5 遍：需求门禁：每次任务前重读 REQUIREMENTS.md（A–G 共 73 行汇总），未完成项不谎称完成；待浏览器回执后第 6 遍核对 SQL/函数/Secret 与真实调用。
- 待核对（浏览器任务进行中）：StudyFlow 项目 SQL 001+002 是否成功、nexus-chat 函数是否部署成功、Secret 名字是否已保存、真实调用是否返回 DeepSeek 内容；未收到回执前不宣称后端已通。
- 第 6 遍（GitHub 回读）：第二提交 d4cfc3dbe5a6f2b89633cfa6ff450e96baec5f31 已确认，study.tsx 回读成功；推送清单 25 个文件，不含 .env/dist/node_modules。

## 合并后端第 7 遍核对（2026-10-28 00:42–00:45，浏览器回执后）
- 浏览器回执：StudyFlow 项目 SQL 001+002 成功，12 张 nexus_ 表全部存在（nexus_agents、nexus_workflows、nexus_prompts、nexus_collections、nexus_models、nexus_runs、nexus_versions、nexus_study_subjects、nexus_study_mistakes、nexus_study_reviews、nexus_study_sessions、nexus_study_tasks）；nexus-chat 函数部署成功，端点 https://gjejcjcpcgkkmiksszrk.supabase.co/functions/v1/nexus-chat；Secret 名字 DEEPSEEK_API_KEY 已保存（只报名字，不复述值）。
- 浏览器修正了本地 SQL 的一个真实 bug：CREATE POLICY 不支持 IF NOT EXISTS，首次运行报 ERROR 42601，浏览器按文件内 DO 块写法做了等效修正后成功。本地两个 migration 已同步改成 DO 块幂等写法，残留 create policy if not exists 计数为 0。
- 学习日历已从 2026 年 10 月固定布局改成当前月份动态生成，月份可前后切换，构建通过。
- 待核实（不谎称已通）：本机命令行直接调 nexus-chat 与读表两次超时，未拿到 DeepSeek 返回或明确报错，属于本机出站超时、不是函数报错；真实模型返回仍需浏览器或应用内实测确认，确认前不在文档里写“真实模型已打通”。
- 第 8 遍（真实模型实测，2026-10-28 03:56–03:58 浏览器仪表盘核对）：nexus-chat 已部署（部署数 2），端点正确；测试调用前调用数为 0、无报错；Secret 名字 DEEPSEEK_API_KEY 在列表中；仪表盘 Test 功能 POST 简单请求返回 HTTP 200，内容为真实模型回答且来源字段为 deepseek-chat。此前本机命令行超时属于本机出站超时，不是函数报错，至此真实模型调用已实测通过。
