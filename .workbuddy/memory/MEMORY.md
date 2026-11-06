# 筑家台账 · 项目长期记忆

## 项目定位

装修全流程信息管理，纯前端单机应用（无后端、无登录），基于 art-design-pro v3 二次开发。

- 路径：`C:\Exercise\zhuangxiu`
- 端口：3006，启动 `pnpm dev`
- 数据：浏览器 localStorage（key `sys-v{version}-renovation`），数据管理页可导出/导入 JSON
- 参考数据：`C:\Exercise\装修\三套辅材标准对比分析.xlsx`（彩石 / 鸿鹄普工 / 鸿鹄精工，22 类辅材）

## 不可破坏的约定

1. 页面必须有单一根元素，否则切页白屏。
2. 组件 `name` 必须与路由 `name` 一致（keepAlive）。
3. 路由只在 `src/router/modules/renovation.ts` 维护，父级 `component: '/index/index'`。
4. 分类只用三级 key，配置在 `src/config/taxonomy/index.ts`，禁止在页面里硬编码中文分类。
5. 金额单位元，统一 `formatMoney`；条目金额默认 `quantity × unitPrice`。
6. 所有业务数据只进 `useRenovationStore`，汇总页是派生视图，不另存一份。
7. 硬装/软装子页是薄壳，共用 `item-workbench`；不要复制三份表格逻辑。
8. Element Plus 组件宽度用内联 style，Tailwind `w-*` 会被覆盖。
9. 部署在子目录 `/renovation/`，`.env.production` 的 `VITE_BASE_URL` 必须是 `/renovation/`；改成 `/` 会导致线上 `/assets/*` 404 白屏。路由为 hash 模式，无需配 router base。

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
