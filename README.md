# NEXUS AI LAB · 下一代智能体实验室

纯前端 AI 智能体开发与工作流编排平台。**不接入后端、不接入 Supabase、不调用真实 AI API、不需要 API Key**，所有运行结果均为前端本地规则模拟，并在界面中明确标注。

## 启动
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # TypeScript + Vite 生产构建
npm run preview  # 预览 dist
```

## 合并版（2026-10-28）：学习管理已并入 Nexus
- 左侧导航新增“学习管理”：仪表盘、错题列表、新增错题、复习计划、学科统计、知识点统计、学习日历、每日任务、学习记录、导入导出、个人设置、管理与诊断，12 个标签页对应 StudyFlow 的 14 个页面功能。
- 复习算法与 StudyFlow 一致：默认间隔 1、3、7、15、30 天，答对延长、答错缩短为 1 天、连续答错优先，手动改日期优先；学科不写死，统计随真实错题动态生成。
- 后端宿主为 StudyFlow 已有新加坡 Supabase 项目（新项目因账号免费上限 2 个被禁用，未暂停、未删除任何现有项目），Nexus 表以 nexus_ 前缀新建，不改动 StudyFlow 原有表；DeepSeek 真实调用走 Edge Function nexus-chat，密钥只在 Supabase Secrets 里，见下方后端说明。
- StudyFlow 原应用（~/workspace/studyflow/ 及其 GitHub/Pages）不动，合并是指 Nexus 内新增一套学习功能模块。

## 后端连接（合并版）
- 本地开发：复制 `.env.example` 为 `.env`，填入 StudyFlow 项目的 URL 与 anon 公开密钥（不要填 service_role），不要提交 `.env`。
- 数据库：在 StudyFlow 项目 SQL 编辑器里依次跑 `supabase/migrations/001_nexus.sql` 再跑 `002_merged_study.sql`（可重跑）。
- 真实模型：部署 `supabase/functions/nexus-chat`，并在 Edge Functions Secrets 里设 `DEEPSEEK_API_KEY`；未设时前端会明确报错并回退本地模拟，不冒充真模型。
- 已知限制：合并版未接入 Supabase Auth 登录页与私有 Storage 图片上传（StudyFlow 原应用有这些能力），未用 Tailwind 与 Playwright，沿用 Nexus 原有纯 CSS 响应式体系；日历为当月布局，到期计数真实。

## 功能导航
- 总览：本地运行记录算出的指标与趋势（非写死数字）
- 智能体：6 个预设角色，卡片/表格视图、搜索/标签/批量删除/收藏，详情 6 个标签（含本地模拟测试控制台）
- 工作流：12 种节点、点选连线、拖动、缩放、平移、撤销/重做、校验、拓扑执行、条件分支、循环上限 5 次、暂停/继续/停止、导入导出 JSON
- 多智能体协作：流程图 / 时间线双视图，Planner→Researcher→Developer→Reviewer→Writer 模拟链路
- 提示词实验室：三栏、`{{变量}}` 自动识别、缺失提示、版本对比、导入导出
- 模型实验室：温度/Top-P/最大输出对比，延迟与成本均为示例假设
- 知识库：本地关键词检索，文档→切分→索引→检索→排序→整理全流程本地运行
- 运行监控 / 实验历史 / 数据分析：全部来自本地运行记录；空状态 + 演示数据入口
- 模板市场：8 个模板，复制后为独立副本
- 命令中心：Ctrl/Cmd+K，方向键选择、回车执行、Esc 关闭
- 系统设置：深浅主题、强调色、密度、动画、默认首页、导航折叠、自动保存、全量导出/导入校验/恢复默认

## 平板响应式（本轮重点）
断点：手机 `<768px` / 平板竖屏 `768–1023px` / 平板横屏 `1024–1279px` / 桌面 `≥1280px`。
- 平板横屏：保留 208px 导航 + 中央 + 280px 右侧面板的多栏工作区
- 平板竖屏：导航变抽屉菜单，右侧属性面板变底部抽屉（不挤压画布），三栏变单栏按“列表→编辑→测试”重排
- 工作流画布：`touch-action:none`，单指平移、双指缩放、触屏拖节点、点出端口再点入端口连线，页面滚动与画布拖动不冲突
- 表格横向滚动、弹窗 `min(860px,96vw)` 且 `max-height:92dvh`、触屏下按钮最小 46px、端口 34px
- 顶部栏会显示当前视口模式（手机/平板竖屏/平板横屏），方便在真机上自查

## 架构与未来扩展
```
src/core/types.ts      统一 TypeScript 数据类型
src/core/engine.ts     WorkflowEngine / AgentExecutor(本地模拟) / KnowledgeRetriever(关键词)
src/core/storage.ts    StorageAdapter：IndexedDB 为主，localStorage 回退
src/core/store.tsx     应用状态 + 演示数据 + 持久化
src/modules/           按模块分的页面组件（智能体/提示词/模型/知识库/工作流/协作/监控/分析/模板/设置）
src/App.tsx            外壳：导航、顶栏、命令中心、视口判断
src/styles.css         主题 + 全站响应式断点
```
未来替换点（不需重写页面）：`AgentExecutor → /api/agents/run`、`ModelProvider → OpenAI 兼容适配器`、`StorageAdapter → Supabase`、`KnowledgeRetriever → 向量嵌入 + pgvector`。密钥绝不硬编码进前端。

## 数据
- 业务数据：IndexedDB（`nexus-ai-lab`），设置同步 localStorage
- 设置 → 全量导出/导入：导入校验 JSON 格式、必需字段、重复 ID；失败不覆盖现有数据
- 破坏性操作（批量删除、清空历史、恢复默认）均需确认
