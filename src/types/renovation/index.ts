/**
 * 装修业务类型定义
 *
 * 约定：
 * - 金额单位统一为「元」，保留两位小数
 * - 分类使用树路径 key，可停在任意层级，如 hard.hvac.ac / hard.main.tile.kitchen-wall
 * - 条目支持一层父子关系：父条目记整体价，子条目记组成明细
 * - 所有实体 id 使用字符串，便于导入导出与本地生成
 */

/** 硬装 / 软装 */
export type SideType = 'hard' | 'soft'

/** 条目状态 */
export type ItemStatus = 'todo' | 'quoted' | 'ordered' | 'delivered' | 'installed' | 'accepted'

/** 付款状态 */
export type PayStatus = 'unpaid' | 'deposit' | 'partial' | 'paid'

/** 采购渠道 */
export type ChannelType = 'company' | 'market' | 'online' | 'offline'

/** 空间（房间） */
export interface Room {
  id: string
  name: string
  area: number
  note: string
}

/** 供应商 / 联系人 */
export interface Vendor {
  id: string
  name: string
  /** 角色：设计师 / 工长 / 监理 / 商家 / 客服 */
  role: string
  company: string
  phone: string
  wechat: string
  note: string
}

/** 装修条目（硬装 / 软装共用一张表） */
export interface RenovationItem {
  id: string
  side: SideType
  /** 分类 key，可停在分类树的任意层级 */
  categoryKey: string
  /** 父条目 id；为空表示顶层条目（子条目只允许一层） */
  parentId?: string
  /** 子条目金额是否单独计入预算；默认 false，避免与父条目整体价重复计算 */
  countInTotal?: boolean
  name: string
  brand: string
  model: string
  spec: string
  roomId: string
  quantity: number
  unit: string
  unitPrice: number
  /** 金额，默认由数量 × 单价计算，可手动覆盖 */
  amount: number
  vendorId: string
  channel: ChannelType
  status: ItemStatus
  payStatus: PayStatus
  paidAmount: number
  orderDate: string
  installDate: string
  /** 质保说明，如「5 年」 */
  warranty: string
  note: string
  createdAt: number
  updatedAt: number
}

/** 报价方案类型 */
export type QuoteKind = 'main' | 'aux'

/** 覆盖度：完整 / 部分 / 未列 */
export type CoverageType = 'full' | 'partial' | 'none'

/** 装修公司 / 报价方案 */
export interface Company {
  id: string
  name: string
  /** 模式：全包 / 半包 / 清包 */
  type: string
  quoteTotal: number
  mainTotal: number
  auxTotal: number
  laborTotal: number
  managementTotal: number
  durationDays: number
  warranty: string
  rating: number
  pros: string[]
  cons: string[]
  contact: string
  phone: string
  note: string
}

/** 公司报价明细（主材 / 辅材逐项） */
export interface CompanyItem {
  id: string
  companyId: string
  kind: QuoteKind
  /** 对齐用的统一分类 key */
  categoryKey: string
  name: string
  brand: string
  model: string
  spec: string
  unit: string
  price: number
  included: boolean
  coverage: CoverageType
  note: string
}

/** 预算与合同 */
export interface BudgetPlan {
  total: number
  contractAmount: number
  designFee: number
  managementFee: number
  startDate: string
  endDate: string
  note: string
}

/** 付款节点 */
export interface PaymentNode {
  id: string
  name: string
  /** 比例，如 0.3 */
  ratio: number
  amount: number
  dueDate: string
  paidDate: string
  status: 'unpaid' | 'partial' | 'paid'
  note: string
}

/** 施工阶段 */
export interface Phase {
  id: string
  name: string
  planStart: string
  planEnd: string
  actualStart: string
  actualEnd: string
  status: 'todo' | 'doing' | 'done'
  note: string
}

/** 验收记录 */
export interface Acceptance {
  id: string
  phaseId: string
  name: string
  date: string
  result: 'pass' | 'fail' | 'pending'
  inspector: string
  note: string
}

/** 问题整改 */
export interface Issue {
  id: string
  title: string
  location: string
  description: string
  vendorId: string
  priority: 'P0' | 'P1' | 'P2'
  dueDate: string
  status: 'open' | 'fixing' | 'done'
  createdAt: number
}

/** 本地分页返回结构（与模板 useTable 的默认适配器一致） */
export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

/** 表格树形行：顶层条目携带一层子条目 */
export interface ItemRow extends RenovationItem {
  children?: ItemRow[]
}

/** 条目查询参数 */
export interface ItemQuery {
  current: number
  size: number
  keyword?: string
  categoryKey?: string
  side?: SideType
  roomId?: string
  status?: ItemStatus | ''
  payStatus?: PayStatus | ''
  companyId?: string
}
