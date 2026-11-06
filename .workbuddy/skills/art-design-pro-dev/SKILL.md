---
name: art-design-pro-dev
description: 在 Art Design Pro（Vue 3 + TS + Vite + Element Plus + Tailwind v4）项目里新增页面、路由、表格、图表与业务模块时使用。包含经源码核对的目录约定、路由注册四步法、组件用法、样式与代码风格、以及本项目踩过的 8 个坑。
---

# Art Design Pro 开发规范（筑家台账项目版）

## 何时使用

- 在本项目中新增/修改页面、路由、菜单
- 使用 ArtTable / useTable / ArtStatsCard / 图表组件
- 调整主题、样式、图标
- 排查「切页白屏」「菜单不出现」「表格高度为 0」等问题

> 本文件基于 art-design-pro v3.x 源码与官方文档（https://www.artd.pro/docs/zh/guide/introduce.html）整理，凡与官方文档冲突，以本文件为准（已核对源码）。

## 技术栈

| 项                       | 版本                     |
| ------------------------ | ------------------------ |
| Vue / Vue Router / Pinia | 3.5 / 4.5 / 3.0          |
| TypeScript / Vite        | 5.6 / 7.x                |
| Element Plus             | 2.11                     |
| Tailwind CSS             | v4（无 config 文件）     |
| ECharts / xlsx           | 6.x / 0.18               |
| 运行环境                 | Node ≥ 20.19，pnpm ≥ 8.8 |

## 目录约定

```
src/
├── api/local/            本地数据接口（纯前端，包装 store 为分页接口）
├── components/
│   ├── business/         业务组件（按模块建目录，index.vue 为入口）
│   └── core/            模板内置组件，不要改
├── config/
│   ├── taxonomy/         分类树配置（三级 key）
│   ├── seed/             种子数据（JSON + TS）
│   └── renovation-dict.ts 业务字典与格式化函数
├── router/modules/       路由模块，index.ts 汇总 routeModules
├── store/modules/        Pinia store（renovation.ts 为业务唯一数据源）
├── types/renovation/     业务类型
├── views/renovation/     页面（每个页面一个目录 + index.vue）
└── utils/ui/iconify-loader.ts 离线图标注册
```

命名：目录 kebab-case，组件 PascalCase，页面目录用业务名（`hard/main`、`process/budget`）。

## 新增一个页面：四步法

### 1. 建页面

`src/views/<模块>/<页面>/index.vue`，**必须有单一根元素**（注释也算根节点）：

```vue
<template>
  <div class="page-content">
    <!-- 内容 -->
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HardMain' }) // 与路由 name 完全一致
</script>
```

### 2. 注册路由

`src/router/modules/renovation.ts`：

```ts
{
  path: '/hard',
  name: 'HardWare',
  component: '/index/index', // 有子菜单的父级固定写这个
  meta: { title: '硬装', icon: 'ri:hammer-line' },
  children: [
    {
      path: 'main',
      name: 'HardMain',
      component: '/renovation/hard/main', // 相对 src/views，可省略 /index
      meta: { title: '主材', icon: 'ri:home-4-line', keepAlive: true }
    }
  ]
}
```

### 3. 确认模块已汇总

`src/router/modules/index.ts` 的 `routeModules` 已展开 `renovationRoutes`；新增独立模块时才需要在此引入。

### 4. 验证

- 菜单自动出现，无需手写菜单组件
- 访问 `http://localhost:3006/#/hard/main`
- `keepAlive: true` 时，组件 `defineOptions({ name })` 必须与路由 `name` 一致，否则缓存失效

### meta 字段速查

`title` 菜单标题（可直接写中文，不必进语言包）、`icon`（`ri:*`）、`keepAlive`、`fixedTab`、`isHide`、`isHideTab`、`roles`（本项目不需要）、`authList`（按钮权限，本项目不需要）。

## 组件速查

| 组件 | 用法要点 |
| --- | --- |
| `ArtTable` | `:columns` + `:data` + `:pagination`；列配置支持 `useSlot: true`，模板里用 `#propName="{ row }"` |
| `ArtTableHeader` | 放 `ElCard.art-table-card` 内、表格上方；`#left` / `#right` 插槽；`layout="refresh,fullscreen"` 可裁剪右侧按钮 |
| `ArtStatsCard` | `title` `:count` `description` `icon` `icon-style="bg-primary"` |
| `ArtSvgIcon` | `icon="ri:home-line"`，尺寸用 `text-xl` 等类 |
| `ArtButtonTable` | 表格行内操作，`type="view\|edit\|delete"` |
| `ArtRingChart` | `:data="[{name,value}]"`、`height`、`:center-text`、`:show-legend` |
| `ArtBarChart` | `:data="number[]"` + `:x-axis-data="string[]"`、`height` |
| `ArtSearchBar` | 声明式搜索栏，`items: [{ key, label, type, props, span }]`，配 `@search` / `@reset` |

图标全部用 Remix Icon（`ri:` 前缀）。离线加载已在 `src/utils/ui/iconify-loader.ts` 注册，断网可用。

## 表格与本地数据

`useTable` 的真实路径是 `@/hooks/core/useTable`（官方文档写的 `@/composables/useTable` 已过时）。

它要求 `apiFn` 返回分页结构：

```ts
{ records: T[], total: number, current: number, size: number }
```

纯前端项目的做法：把所有数据放在 Pinia，`src/api/local/item.ts` 读取 store 并模拟异步分页，页面照常使用 `useTable`。将来接后端只改 api 层。

```ts
const {
  data,
  loading,
  pagination,
  searchParams,
  getData,
  refreshData,
  handleSizeChange,
  handleCurrentChange
} = useTable({
  core: {
    apiFn: fetchItemPage,
    apiParams: { current: 1, size: 20, side: 'hard' }
  }
})
```

改筛选项后：`Object.assign(searchParams, {...}); getData()`。

## 样式规范

- 优先 Tailwind 工具类 + 项目扩展类：`flex-c` `flex-cb` `flex-cc` `tad-200` `border-b-d` `text-g-500` `bg-box` `c-p`
- 颜色一律用 CSS 变量：`var(--art-gray-*)` `var(--default-box-color)` `var(--default-border)` `var(--el-color-danger)`；禁止硬编码色值
- 页面全高布局：根元素加 `art-full-height`，表格卡片加 `ElCard.art-table-card`（内部自动 `flex:1`）
- 卡片圆角：`calc(var(--custom-radius) / 2 + 2px)`
- 暗色模式由 `.dark` 类 + CSS 变量自动适配，不要写死白底

### 重要：Tailwind 宽度类对 Element Plus 组件无效

Element Plus 的 `.el-input { width: 100% }` 未分层，优先级高于 Tailwind `@layer utilities`，`class="w-56"` 会被忽略。**必须用内联 style**：

```vue
<ElInput style="width: 220px" />
<ElSelect style="width: 128px" />
```

## 代码风格（Prettier 已配置）

- 无分号、单引号、2 空格、`printWidth: 100`、`trailingComma: none`
- Vue 的 `<script>` / `<style>` 内容整体缩进 2 格
- 提交信息遵循 `feat / fix / docs / style / refactor / perf / test / build / chore`
- 本项目已移除 husky `prepare`（避免沙箱下安装失败），需要时手动 `pnpm exec husky`

## 8 个必踩的坑

1. **切页白屏**：页面有多个根节点（含注释），`<Transition>` 失效。全部内容包在一个 `div` 里。
2. **表格高度 0**：`ElTable height="100%"` 的父级必须有确定高度；在自适应布局里用固定像素（如 `height="420"`）最稳。
3. **菜单不出现**：路由模块没被 `routeModules` 引入，或父级 `component` 没写 `/index/index`。
4. **keepAlive 失效**：组件 `name` 与路由 `name` 不一致。
5. **Tailwind 宽度失效**：见上，用内联 style。
6. **表单标签写错**：是 `<ElFormItem>`，不是 `<ElForm-item>`（后者能编译但样式异常）。
7. **模板属性里写表达式**：`description="共 " + count + " 项"` 会报 `Duplicate attribute`，改成 `:description="`共 ${count} 项`"`。
8. **Vite 依赖预构建刷新**：首次用新的 Element Plus 子组件时控制台提示 `new dependencies optimized`，把依赖加进 `vite.config.ts` 的 `optimizeDeps.include`。

## 校验命令

```bash
pnpm dev                      # 开发，端口 3006
pnpm exec vue-tsc --noEmit    # 类型检查（提交前必跑）
pnpm build                    # 生产构建（内含 vue-tsc）
pnpm lint                     # ESLint
pnpm lint:stylelint           # Stylelint
```

## 本项目的业务约定

- 分类：三级 key，`hard.main.tile.kitchen-wall`；新增细类只改 `src/config/taxonomy/index.ts`
- 金额：单位「元」，`amount = quantity × unitPrice`，允许手动覆盖；格式化统一用 `formatMoney`
- 条目状态：`todo → quoted → ordered → delivered → installed → accepted`
- 付款状态：`unpaid / deposit / partial / paid`
- 数据唯一来源：`useRenovationStore`，汇总页是同一份 `items` 的只读派生
- 持久化：Pinia persist + localStorage，key 为 `sys-v{version}-renovation`
- 导入导出：`store.exportData()` / `store.importData()`，版本号 `version: 1`
- 种子数据：`src/config/seed/`，来源为 `C:\Exercise\装修` 的三套辅材标准（22 类）
