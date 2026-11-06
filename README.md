# 筑家台账

装修全流程信息管理，纯前端单机应用。基于 [Art Design Pro](https://www.artd.pro/docs/zh/guide/introduce.html) 二次开发。

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3006
```

环境要求：Node ≥ 20.19，pnpm ≥ 8.8。

```bash
pnpm build                    # 生产构建（含 vue-tsc 类型检查）
pnpm exec vue-tsc --noEmit    # 只做类型检查
pnpm lint                     # ESLint
```

打开即用，无需登录。数据保存在浏览器本地（localStorage），不会上传。

## 功能模块

| 模块 | 说明 |
| --- | --- |
| 首页看板 | 金额、已付/待付、预算执行、硬软装结构、各空间花费、施工进度、待办、最近录入 |
| 汇总 | 硬装 + 软装全量只读视图，分类树汇总 + 条目明细，支持查询、删除、导出 Excel |
| 硬装 | 暖通 / 门窗 / 主材 / 辅材 / 全屋定制 / 成品家具，三级分类（如 主材 → 瓷砖 → 厨房墙砖） |
| 软装 | 家电 / 智能家居 / 装饰，同样支持三级细分 |
| 装修公司对比 | 公司档案、报价明细、22 类辅材逐项对比（覆盖度 + 差异要点 + 报价对比） |
| 预算与合同 | 预算总额、合同金额、设计费、管理费、付款节点 |
| 进度与验收 | 9 个施工阶段、状态与日期、验收记录 |
| 问题整改 | 缺陷记录、优先级、责任方、限期、状态流转 |
| 供应商通讯录 | 设计师 / 工长 / 监理 / 商家联系人与备注 |
| 数据管理 | 房间管理、JSON 备份导出/导入、重置、清空 |

## 目录结构

```
src/
├── api/local/                    本地分页接口（包装 store，供 useTable 使用）
├── components/business/renovation/
│   ├── category-tree/            三级分类树
│   ├── item-workbench/           录入工作台（树 + 表格 + 弹窗）
│   ├── item-table/               条目表格
│   ├── item-form-dialog/         新增 / 编辑表单
│   └── item-detail-drawer/       只读详情
├── config/
│   ├── taxonomy/                 分类树（加细类只改这里）
│   ├── seed/                     种子数据（含 22 类辅材标准 JSON）
│   └── renovation-dict.ts        状态字典、金额与日期格式化
├── router/modules/renovation.ts  全部业务路由
├── store/modules/renovation.ts   业务唯一数据源（持久化）
├── types/renovation/             业务类型
└── views/renovation/             18 个页面
```

## 数据说明

- 条目统一存在 `items`，硬装/软装只是 `side` 不同；汇总是同一份数据的派生视图，不存在两份数据。
- 分类使用三级 key，例如 `hard.main.tile.kitchen-wall`，配置在 `src/config/taxonomy/index.ts`。
- 种子数据来自 `C:\Exercise\装修\三套辅材标准对比分析.xlsx`：彩石设计 / 鸿鹄普工 / 鸿鹄海派精工，22 类统一口径。
  - 覆盖度以「05 覆盖度矩阵」为准：彩石 20 类、普工 18 类、精工 17 类（原文总览写 18 类，存在 1 类差异，已在公司备注中标注）。
- 备份：数据管理 → 导出 JSON；导入会覆盖当前全部数据，导入前请先备份。

## 开发规范

项目级技能文档：`.workbuddy/skills/art-design-pro-dev/SKILL.md`

包含新增页面四步法、路由与 keepAlive 规则、ArtTable/useTable 用法、Tailwind 与 Element Plus 的样式冲突、8 个高频坑。

## 已知限制

- 单机版，无多端同步；换浏览器/清缓存会丢失数据，请定期导出备份。
- 暂未做照片附件（IndexedDB）与打印排版。
- 模板演示页已移至 `.archive/`（不参与构建、已加入 .gitignore），确认不需要后可删除。
