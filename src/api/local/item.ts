/**
 * 本地数据接口
 *
 * 纯前端项目没有后端，这里把 Pinia 仓库包装成「异步分页接口」，
 * 让模板的 useTable 可以原样使用；将来接后端时只替换本文件即可。
 */
import { useRenovationStore } from '@/store/modules/renovation'
import { isUnderCategory } from '@/config/taxonomy'
import type { ItemQuery, PageResult, RenovationItem } from '@/types/renovation'

function matchKeyword(item: RenovationItem, keyword: string): boolean {
  const text = [item.name, item.brand, item.model, item.spec, item.note]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return text.includes(keyword.toLowerCase())
}

export function queryItems(params: ItemQuery): RenovationItem[] {
  const store = useRenovationStore()
  let list = [...store.items]

  if (params.side) {
    list = list.filter((item) => item.side === params.side)
  }
  if (params.categoryKey) {
    list = list.filter((item) => isUnderCategory(item.categoryKey, params.categoryKey as string))
  }
  if (params.roomId) {
    list = list.filter((item) => item.roomId === params.roomId)
  }
  if (params.status) {
    list = list.filter((item) => item.status === params.status)
  }
  if (params.payStatus) {
    list = list.filter((item) => item.payStatus === params.payStatus)
  }
  if (params.keyword) {
    list = list.filter((item) => matchKeyword(item, params.keyword as string))
  }

  return list.sort((a, b) => b.updatedAt - a.updatedAt)
}

export function fetchItemPage(params: ItemQuery): Promise<PageResult<RenovationItem>> {
  const list = queryItems(params)
  const current = Number(params.current) || 1
  const size = Number(params.size) || 20
  const start = (current - 1) * size
  return Promise.resolve({
    records: list.slice(start, start + size),
    total: list.length,
    current,
    size
  })
}
