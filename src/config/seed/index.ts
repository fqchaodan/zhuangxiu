/**
 * 种子数据
 *
 * - 辅材标准来自 C:\Exercise\装修\三套辅材标准对比分析.xlsx
 *   （彩石设计 / 鸿鹄普工 / 鸿鹄海派精工，22 类统一口径）
 * - 房间、阶段、付款节点为通用模板，可在页面中自行调整
 */
import type {
  BudgetPlan,
  Company,
  CompanyItem,
  CoverageType,
  PaymentNode,
  Phase,
  Room
} from '@/types/renovation'
import auxStandardJson from './aux-standard.json'

export interface AuxStandardRow {
  key: string
  name: string
  cells: [string, string, string]
  same: string
  diff: string
  cov: [string, string, string]
}

export const auxStandardRows = auxStandardJson as AuxStandardRow[]

const COVERAGE_MAP: Record<string, CoverageType> = {
  '●': 'full',
  '◐': 'partial',
  '○': 'none'
}

export const seedCompanies: Company[] = [
  {
    id: 'company-caishi',
    name: '彩石设计',
    type: '半包',
    quoteTotal: 0,
    mainTotal: 0,
    auxTotal: 0,
    laborTotal: 0,
    managementTotal: 0,
    durationDays: 0,
    warranty: '辅材按品牌原厂质保，焊接 50 年',
    rating: 0,
    pros: [
      '方案数量最多（34 条 / 5 品类）',
      '20 类覆盖，其中 9 类提供多方案',
      '水电与泥作配套齐全'
    ],
    cons: ['未列木龙骨', '未列瓷砖背胶', '多方案未锁价，需逐项确认'],
    contact: '',
    phone: '',
    note: '来源：彩石·辅料介绍.pptx'
  },
  {
    id: 'company-honghu-normal',
    name: '鸿鹄设计 · 普工',
    type: '半包',
    quoteTotal: 0,
    mainTotal: 0,
    auxTotal: 0,
    laborTotal: 0,
    managementTotal: 0,
    durationDays: 0,
    warranty: '按合同约定',
    rating: 0,
    pros: ['19 条 / 4 品类，基础配置齐全', '品牌以国产一线为主，便于采购'],
    cons: [
      '18 类覆盖，为三套中最低',
      '电线为 B 级阻燃、网线为六类',
      '墙固引用标准与品类不对应，存在风险'
    ],
    contact: '',
    phone: '',
    note: '来源：鸿鹄设计辅材清单表（详易版）'
  },
  {
    id: 'company-honghu-fine',
    name: '鸿鹄设计 · 海派精工',
    type: '半包',
    quoteTotal: 0,
    mainTotal: 0,
    auxTotal: 0,
    laborTotal: 0,
    managementTotal: 0,
    durationDays: 0,
    warranty: '70 年原厂质保（部分材料）',
    rating: 0,
    pros: [
      '档次与量化指标最强',
      'A 类无卤低烟 125℃ 电线、CAT6A 网线',
      '>100g 镀铝锌龙骨、甲醛分解 ≥93%'
    ],
    cons: ['未列底盒 / 端子 / 底漆', '主龙骨规格表述存疑', '石膏板厚度 9.5 与 9.8–10 自相矛盾'],
    contact: '',
    phone: '',
    note: '来源：鸿鹄海派精工辅材表；覆盖度矩阵计 17 类，原文总览写 18 类，存在 1 类差异'
  }
]

/** 从原文中抽取「品牌/型号」片段，供对比矩阵单元格使用 */
function pickBrand(spec: string): string {
  const matched = spec.match(/【品牌\/型号】([^｜]+)/)
  if (matched) return matched[1].trim()
  const first = spec.split('｜')[0]
  return first
    .replace(/【[^】]+】/g, '')
    .trim()
    .slice(0, 40)
}

export const seedCompanyItems: CompanyItem[] = seedCompanies.flatMap((company, index) =>
  auxStandardRows.map((row) => {
    const spec = row.cells[index] || ''
    return {
      id: `${company.id}-${row.key}`,
      companyId: company.id,
      kind: 'aux' as const,
      categoryKey: row.key,
      name: row.name,
      brand: pickBrand(spec),
      model: '',
      spec,
      unit: '',
      price: 0,
      included: row.cov[index] !== '○',
      coverage: COVERAGE_MAP[row.cov[index]] ?? 'none',
      note: row.diff
    }
  })
)

export const seedRooms: Room[] = [
  { id: 'room-living', name: '客厅', area: 28, note: '' },
  { id: 'room-dining', name: '餐厅', area: 12, note: '' },
  { id: 'room-kitchen', name: '厨房', area: 8, note: '' },
  { id: 'room-master', name: '主卧', area: 18, note: '' },
  { id: 'room-second', name: '次卧', area: 12, note: '' },
  { id: 'room-bath', name: '卫生间', area: 6, note: '' },
  { id: 'room-balcony', name: '阳台', area: 6, note: '' },
  { id: 'room-entry', name: '玄关', area: 4, note: '' }
]

export const seedBudget: BudgetPlan = {
  total: 0,
  contractAmount: 0,
  designFee: 0,
  managementFee: 0,
  startDate: '',
  endDate: '',
  note: ''
}

export const seedPayments: PaymentNode[] = [
  {
    id: 'pay-1',
    name: '开工款',
    ratio: 0.3,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid',
    note: '签订合同后支付'
  },
  {
    id: 'pay-2',
    name: '水电验收款',
    ratio: 0.3,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid',
    note: '水电验收合格后支付'
  },
  {
    id: 'pay-3',
    name: '泥木验收款',
    ratio: 0.3,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid',
    note: '泥木验收合格后支付'
  },
  {
    id: 'pay-4',
    name: '竣工款',
    ratio: 0.05,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid',
    note: '竣工验收后支付'
  },
  {
    id: 'pay-5',
    name: '质保尾款',
    ratio: 0.05,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid',
    note: '入住三个月后支付'
  }
]

export const seedPhases: Phase[] = [
  {
    id: 'phase-1',
    name: '拆改',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-2',
    name: '水电',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-3',
    name: '防水',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-4',
    name: '泥瓦',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-5',
    name: '木工',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-6',
    name: '油漆',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-7',
    name: '安装',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-8',
    name: '软装进场',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  },
  {
    id: 'phase-9',
    name: '竣工验收',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  }
]
