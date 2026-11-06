/**
 * 装修业务字典与格式化工具
 */
import type { ChannelType, CoverageType, ItemStatus, PayStatus } from '@/types/renovation'

export interface DictOption<T = string> {
  value: T
  label: string
  /** ElTag 类型 */
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export const ITEM_STATUS_OPTIONS: DictOption<ItemStatus>[] = [
  { value: 'todo', label: '待确定', type: 'info' },
  { value: 'quoted', label: '已询价', type: 'primary' },
  { value: 'ordered', label: '已下单', type: 'warning' },
  { value: 'delivered', label: '已到货', type: 'warning' },
  { value: 'installed', label: '已安装', type: 'success' },
  { value: 'accepted', label: '已验收', type: 'success' }
]

export const PAY_STATUS_OPTIONS: DictOption<PayStatus>[] = [
  { value: 'unpaid', label: '未付款', type: 'info' },
  { value: 'deposit', label: '已付定金', type: 'warning' },
  { value: 'partial', label: '部分付款', type: 'warning' },
  { value: 'paid', label: '已付清', type: 'success' }
]

export const CHANNEL_OPTIONS: DictOption<ChannelType>[] = [
  { value: 'company', label: '装修公司', type: 'primary' },
  { value: 'market', label: '建材市场', type: 'info' },
  { value: 'offline', label: '线下门店', type: 'info' },
  { value: 'online', label: '线上平台', type: 'info' }
]

export const COVERAGE_OPTIONS: DictOption<CoverageType>[] = [
  { value: 'full', label: '完整覆盖', type: 'success' },
  { value: 'partial', label: '部分覆盖', type: 'warning' },
  { value: 'none', label: '未列', type: 'danger' }
]

export const UNIT_OPTIONS = [
  '项',
  '个',
  '件',
  '套',
  '台',
  '把',
  '樘',
  '组',
  '块',
  '张',
  '桶',
  '袋',
  '包',
  '根',
  '盆',
  '幅',
  '面',
  '㎡',
  'm'
]

export const VENDOR_ROLE_OPTIONS = ['设计师', '工长', '监理', '商家', '客服', '其他']

export function getDictMeta<T extends string>(
  options: DictOption<T>[],
  value: T | ''
): DictOption<T> | undefined {
  return options.find((item) => item.value === value)
}

/** 金额格式化：12,345.00 */
export function formatMoney(value: number | null | undefined, symbol = ''): string {
  const num = Number(value || 0)
  const text = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return symbol ? `${symbol}${text}` : text
}

/** 金额简写：1.2 万 */
export function formatMoneyShort(value: number | null | undefined): string {
  const num = Number(value || 0)
  if (Math.abs(num) >= 10000) {
    return `${(num / 10000).toFixed(1)} 万`
  }
  return formatMoney(num)
}

/** 时间戳格式化为 YYYY-MM-DD HH:mm */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 今天，YYYY-MM-DD */
export function today(): string {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 百分比 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}
