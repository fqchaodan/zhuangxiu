/**
 * 本地数据接口
 *
 * 纯前端项目没有后端，这里把 Pinia 仓库包装成「异步分页接口」，
 * 让模板的 useTable 可以原样使用；将来接后端时只替换本文件即可。
 */
import { useRenovationStore } from '@/store/modules/renovation'
import { isUnderCategory } from '@/config/taxonomy'
import type { ItemQuery, ItemRow, PageResult, RenovationItem } from '@/types/renovation'

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

/**
 * 把平铺条目组装成「顶层条目 + 一层子条目」的树形行
 *
 * 若筛选后父条目不在结果里（例如只搜中了某个子项），该子项提升为顶层行，
 * 保证用户搜到的内容不会凭空消失。
 */
export function buildItemTree(list: RenovationItem[]): ItemRow[] {
  const ids = new Set(list.map((item) => item.id))
  const childrenMap = new Map<string, RenovationItem[]>()
  const roots: RenovationItem[] = []

  list.forEach((item) => {
    if (item.parentId && ids.has(item.parentId)) {
      const siblings = childrenMap.get(item.parentId) || []
      siblings.push(item)
      childrenMap.set(item.parentId, siblings)
    } else {
      roots.push(item)
    }
  })

  return roots
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => {
      const children = (childrenMap.get(item.id) || [])
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((child) => ({ ...child }))
      return children.length ? { ...item, children } : { ...item }
    })
}

/** 分页按「顶层条目」计数，子条目跟随父条目一起返回，不会跨页拆散 */
export function fetchItemPage(params: ItemQuery): Promise<PageResult<ItemRow>> {
  const rows = buildItemTree(queryItems(params))
  const current = Number(params.current) || 1
  const size = Number(params.size) || 20
  const start = (current - 1) * size
  return Promise.resolve({
    records: rows.slice(start, start + size),
    total: rows.length,
    current,
    size
  })
}
