/**
 * 装修数据仓库
 *
 * 全站唯一数据源：硬装 / 软装条目、公司报价、预算、进度、问题、供应商。
 * 汇总是同一份 items 的只读派生，因此不存在两份数据不一致的问题。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  Acceptance,
  BudgetPlan,
  Company,
  CompanyItem,
  Issue,
  PaymentNode,
  Phase,
  RenovationItem,
  Room,
  Vendor
} from '@/types/renovation'
import {
  seedBudget,
  seedCompanies,
  seedCompanyItems,
  seedPayments,
  seedPhases,
  seedRooms
} from '@/config/seed'

let idSeed = 0

/** 生成稳定且可读的本地 id */
export function createId(prefix: string): string {
  idSeed += 1
  return `${prefix}-${Date.now().toString(36)}-${idSeed}`
}

export const useRenovationStore = defineStore(
  'renovationStore',
  () => {
    const items = ref<RenovationItem[]>([])
    const rooms = ref<Room[]>([])
    const vendors = ref<Vendor[]>([])
    const companies = ref<Company[]>([])
    const companyItems = ref<CompanyItem[]>([])
    const budget = ref<BudgetPlan>({ ...seedBudget })
    const payments = ref<PaymentNode[]>([])
    const phases = ref<Phase[]>([])
    const acceptances = ref<Acceptance[]>([])
    const issues = ref<Issue[]>([])
    const seeded = ref(false)

    /** 首次启动写入基础数据；用户清空后不会再次灌入 */
    function ensureSeed(): void {
      if (seeded.value) return
      rooms.value = seedRooms.map((item) => ({ ...item }))
      companies.value = seedCompanies.map((item) => ({ ...item }))
      companyItems.value = seedCompanyItems.map((item) => ({ ...item }))
      payments.value = seedPayments.map((item) => ({ ...item }))
      phases.value = seedPhases.map((item) => ({ ...item }))
      budget.value = { ...seedBudget }
      seeded.value = true
    }

    /* ---------------- 条目 ---------------- */

    function upsertItem(
      payload: Omit<RenovationItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
    ): RenovationItem {
      const now = Date.now()
      const existed = payload.id ? items.value.find((item) => item.id === payload.id) : undefined
      if (existed) {
        Object.assign(existed, payload, { updatedAt: now })
        return existed
      }
      const created: RenovationItem = {
        ...payload,
        id: payload.id || createId('item'),
        createdAt: now,
        updatedAt: now
      }
      items.value.unshift(created)
      return created
    }

    function removeItem(id: string): void {
      items.value = items.value.filter((item) => item.id !== id)
    }

    function removeItems(ids: string[]): void {
      const set = new Set(ids)
      items.value = items.value.filter((item) => !set.has(item.id))
    }

    /* ---------------- 房间 ---------------- */

    function upsertRoom(payload: Room): void {
      const existed = rooms.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else rooms.value.push({ ...payload, id: payload.id || createId('room') })
    }

    function removeRoom(id: string): void {
      rooms.value = rooms.value.filter((item) => item.id !== id)
      items.value.forEach((item) => {
        if (item.roomId === id) item.roomId = ''
      })
    }

    /* ---------------- 供应商 ---------------- */

    function upsertVendor(payload: Vendor): void {
      const existed = vendors.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else vendors.value.push({ ...payload, id: payload.id || createId('vendor') })
    }

    function removeVendor(id: string): void {
      vendors.value = vendors.value.filter((item) => item.id !== id)
      items.value.forEach((item) => {
        if (item.vendorId === id) item.vendorId = ''
      })
    }

    /* ---------------- 公司 ---------------- */

    function upsertCompany(payload: Company): void {
      const existed = companies.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else companies.value.push({ ...payload, id: payload.id || createId('company') })
    }

    function removeCompany(id: string): void {
      companies.value = companies.value.filter((item) => item.id !== id)
      companyItems.value = companyItems.value.filter((item) => item.companyId !== id)
    }

    function upsertCompanyItem(payload: CompanyItem): void {
      const existed = companyItems.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else companyItems.value.push({ ...payload, id: payload.id || createId('company-item') })
    }

    function removeCompanyItem(id: string): void {
      companyItems.value = companyItems.value.filter((item) => item.id !== id)
    }

    /* ---------------- 预算与付款 ---------------- */

    function setBudget(payload: BudgetPlan): void {
      budget.value = { ...payload }
    }

    function upsertPayment(payload: PaymentNode): void {
      const existed = payments.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else payments.value.push({ ...payload, id: payload.id || createId('pay') })
    }

    function removePayment(id: string): void {
      payments.value = payments.value.filter((item) => item.id !== id)
    }

    /* ---------------- 进度与验收 ---------------- */

    function upsertPhase(payload: Phase): void {
      const existed = phases.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else phases.value.push({ ...payload, id: payload.id || createId('phase') })
    }

    function removePhase(id: string): void {
      phases.value = phases.value.filter((item) => item.id !== id)
    }

    function upsertAcceptance(payload: Acceptance): void {
      const existed = acceptances.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else acceptances.value.push({ ...payload, id: payload.id || createId('accept') })
    }

    function removeAcceptance(id: string): void {
      acceptances.value = acceptances.value.filter((item) => item.id !== id)
    }

    /* ---------------- 问题整改 ---------------- */

    function upsertIssue(payload: Issue): void {
      const existed = issues.value.find((item) => item.id === payload.id)
      if (existed) Object.assign(existed, payload)
      else
        issues.value.push({
          ...payload,
          id: payload.id || createId('issue'),
          createdAt: Date.now()
        })
    }

    function removeIssue(id: string): void {
      issues.value = issues.value.filter((item) => item.id !== id)
    }

    /* ---------------- 汇总指标 ---------------- */

    const hardItems = computed(() => items.value.filter((item) => item.side === 'hard'))
    const softItems = computed(() => items.value.filter((item) => item.side === 'soft'))

    const hardTotal = computed(() => hardItems.value.reduce((sum, item) => sum + item.amount, 0))
    const softTotal = computed(() => softItems.value.reduce((sum, item) => sum + item.amount, 0))
    const grandTotal = computed(() => hardTotal.value + softTotal.value)

    const paidTotal = computed(() =>
      items.value.reduce((sum, item) => sum + (item.paidAmount || 0), 0)
    )
    const unpaidTotal = computed(() => Math.max(grandTotal.value - paidTotal.value, 0))

    const installedCount = computed(
      () =>
        items.value.filter((item) => item.status === 'installed' || item.status === 'accepted')
          .length
    )

    const openIssueCount = computed(
      () => issues.value.filter((item) => item.status !== 'done').length
    )

    const donePhaseCount = computed(
      () => phases.value.filter((item) => item.status === 'done').length
    )

    /** 按分类前缀汇总金额 */
    function sumByCategory(prefix: string): number {
      return items.value
        .filter((item) => item.categoryKey === prefix || item.categoryKey.startsWith(`${prefix}.`))
        .reduce((sum, item) => sum + item.amount, 0)
    }

    /** 按房间汇总金额 */
    function sumByRoom(roomId: string): number {
      return items.value
        .filter((item) => item.roomId === roomId)
        .reduce((sum, item) => sum + item.amount, 0)
    }

    /* ---------------- 数据管理 ---------------- */

    function clearAll(): void {
      items.value = []
      rooms.value = []
      vendors.value = []
      companies.value = []
      companyItems.value = []
      budget.value = { ...seedBudget }
      payments.value = []
      phases.value = []
      acceptances.value = []
      issues.value = []
      seeded.value = true
    }

    function resetToSeed(): void {
      clearAll()
      seeded.value = false
      ensureSeed()
    }

    function exportData() {
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        items: items.value,
        rooms: rooms.value,
        vendors: vendors.value,
        companies: companies.value,
        companyItems: companyItems.value,
        budget: budget.value,
        payments: payments.value,
        phases: phases.value,
        acceptances: acceptances.value,
        issues: issues.value
      }
    }

    function importData(data: ReturnType<typeof exportData>): void {
      items.value = data.items ?? []
      rooms.value = data.rooms ?? []
      vendors.value = data.vendors ?? []
      companies.value = data.companies ?? []
      companyItems.value = data.companyItems ?? []
      budget.value = data.budget ?? { ...seedBudget }
      payments.value = data.payments ?? []
      phases.value = data.phases ?? []
      acceptances.value = data.acceptances ?? []
      issues.value = data.issues ?? []
      seeded.value = true
    }

    return {
      items,
      rooms,
      vendors,
      companies,
      companyItems,
      budget,
      payments,
      phases,
      acceptances,
      issues,
      seeded,
      hardItems,
      softItems,
      hardTotal,
      softTotal,
      grandTotal,
      paidTotal,
      unpaidTotal,
      installedCount,
      openIssueCount,
      donePhaseCount,
      ensureSeed,
      upsertItem,
      removeItem,
      removeItems,
      upsertRoom,
      removeRoom,
      upsertVendor,
      removeVendor,
      upsertCompany,
      removeCompany,
      upsertCompanyItem,
      removeCompanyItem,
      setBudget,
      upsertPayment,
      removePayment,
      upsertPhase,
      removePhase,
      upsertAcceptance,
      removeAcceptance,
      upsertIssue,
      removeIssue,
      sumByCategory,
      sumByRoom,
      clearAll,
      resetToSeed,
      exportData,
      importData
    }
  },
  {
    persist: {
      key: 'renovation',
      storage: localStorage
    }
  }
)
