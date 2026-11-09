# 筑家台账 · 项目长期记忆

## 项目定位

装修全流程信息管理，纯前端单机应用（无后端、无登录），基于 art-design-pro v3 二次开发。

- 路径：`C:\Exercise\zhuangxiu`
- 端口：3006，启动 `pnpm dev`
- 远程：`https://github.com/fqchaodan/zhuangxiu.git`（主分支 `master`）
- 数据：浏览器 localStorage（key `sys-v{version}-renovation`），数据管理页可导出/导入 JSON
- 参考数据：`C:\Exercise\装修\三套辅材标准对比分析.xlsx`（彩石 / 鸿鹄普工 / 鸿鹄精工，22 类辅材）

## 不可破坏的约定

1. 页面必须有单一根元素，否则切页白屏。
2. 组件 `name` 必须与路由 `name` 一致（keepAlive）。
3. 路由只在 `src/router/modules/renovation.ts` 维护，父级 `component: '/index/index'`。
4. 分类树配置在 `src/config/taxonomy/index.ts`，禁止在页面里硬编码中文分类；条目可挂在**任意层级**（中间层级用于「整体价」，如 `hard.hvac.ac` 中央空调）。
5. 金额单位元，统一 `formatMoney`；条目金额默认 `quantity × unitPrice`。
6. 所有业务数据只进 `useRenovationStore`，汇总页是派生视图，不另存一份。
7. 硬装/软装子页是薄壳，共用 `item-workbench`；不要复制三份表格逻辑。
8. Element Plus 组件宽度用内联 style，Tailwind `w-*` 会被覆盖。
9. 部署在子目录 `/renovation/`，`.env.production` 的 `VITE_BASE_URL` 必须是 `/renovation/`；改成 `/` 会导致线上 `/assets/*` 404 白屏。路由为 hash 模式，无需配 router base。
10. 目录/文件名禁止用 Windows 保留设备名（`con/prn/aux/nul/com1-9/lpt1-9`）。`aux` 目录已改名 `src/views/renovation/hard/auxiliary/`，否则 git 无法索引（`could not open ... for reading`）。
11. 条目支持一层父子：`parentId` 指向父条目。预算口径统一走 store 的 `isBillableItem` / `billableItems`：顶层条目恒计入，子项默认只作明细，需显式勾选 `countInTotal` 才单独计价。**所有金额统计**（hardTotal/softTotal/grandTotal/paidTotal/sumByCategory/sumByRoom、汇总页、工作台 stat）都必须基于这个口径，禁止直接对 `store.items` 求和。
12. `fetchItemPage` 按「顶层条目」分组分页，子项挂在 `children` 上交给树形表格；搜索只命中子项时把它提升为顶层行，不能让父子跨页拆散。删除父条目会级联删除子项。
13. `ElCascader` 选任意层级需 `checkStrictly: true`；还必须加 `checkOnClickNode: true`（否则点节点文字不生效、只能点左侧 radio），且严格模式不自动收起面板，要在 `@change` 里调 `togglePopperVisible(false)`。

## 代码风格

无分号、单引号、2 空格、100 列；Vue script/style 整体缩进 2 格；提交用 `feat/fix/...`。

## 常用命令

```bash
pnpm dev
pnpm exec vue-tsc --noEmit
pnpm build
pnpm lint
```

## 目录速记

- 业务组件：`src/components/business/renovation/`
- 页面：`src/views/renovation/`
- 数据字典：`src/config/renovation-dict.ts`
- 种子：`src/config/seed/`
- 规范：`.workbuddy/skills/art-design-pro-dev/SKILL.md`
- 模板演示页归档：`.archive/`（不参与构建）
