<!-- 汇总：硬装 / 软装全量只读视图，仅支持删除 -->
<template>
  <div class="summary-page art-full-height">
    <div class="summary-stats">
      <div class="stat-tile">
        <span class="stat-tile__label">合计金额</span>
        <span class="stat-tile__value">¥ {{ formatMoney(summary.amount) }}</span>
        <span class="stat-tile__sub">
          {{ summary.count }} 条记录<span v-if="detailCount"> · 另有 {{ detailCount }} 条明细</span>
        </span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">硬装合计</span>
        <span class="stat-tile__value">¥ {{ formatMoney(summary.hard) }}</span>
        <span class="stat-tile__sub">{{ summary.hardCount }} 条</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">软装合计</span>
        <span class="stat-tile__value">¥ {{ formatMoney(summary.soft) }}</span>
        <span class="stat-tile__sub">{{ summary.softCount }} 条</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">已付 / 未付</span>
        <span class="stat-tile__value stat-tile__value--primary">
          ¥ {{ formatMoney(summary.paid) }}
        </span>
        <span class="stat-tile__sub">未付 ¥ {{ formatMoney(summary.unpaid) }}</span>
      </div>
    </div>

    <div class="summary-toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <ElRadioGroup v-model="side" size="default">
          <ElRadioButton value="all">全部</ElRadioButton>
          <ElRadioButton value="hard">硬装</ElRadioButton>
          <ElRadioButton value="soft">软装</ElRadioButton>
        </ElRadioGroup>
        <ElRadioGroup v-model="view" size="default">
          <ElRadioButton value="tree">分类汇总</ElRadioButton>
          <ElRadioButton value="list">条目明细</ElRadioButton>
        </ElRadioGroup>
        <ElInput
          v-model="keyword"
          placeholder="搜索名称 / 品牌 / 备注"
          clearable
          style="width: 210px"
        />
        <ElSelect v-model="roomId" placeholder="房间" clearable style="width: 120px">
          <ElOption
            v-for="room in store.rooms"
            :key="room.id"
            :label="room.name"
            :value="room.id"
          />
        </ElSelect>
        <ElSelect v-model="status" placeholder="状态" clearable style="width: 120px">
          <ElOption
            v-for="option in ITEM_STATUS_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </div>

      <div class="flex items-center gap-2">
        <ElButton
          v-if="view === 'list' && selectedRows.length"
          type="danger"
          plain
          @click="handleBatchDelete"
        >
          删除选中 {{ selectedRows.length }} 条
        </ElButton>
        <ElButton @click="handleExport">
          <ArtSvgIcon icon="ri:file-excel-2-line" class="mr-1" />
          导出 Excel
        </ElButton>
      </div>
    </div>

    <ElCard class="art-table-card summary-card">
      <div v-if="view === 'tree'" class="summary-tree">
        <ElTable
          :data="treeRows"
          row-key="key"
          :tree-props="{ children: 'children' }"
          default-expand-all
          height="100%"
          :indent="16"
        >
          <ElTableColumn prop="label" label="分类" min-width="240">
            <template #default="{ row }">
              <span :class="{ 'font-medium': row.level === 1 }">{{ row.label }}</span>
              <span v-if="row.level === 1" class="ml-2 text-xs text-g-500">
                {{ row.count }} 条
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="count" label="条目数" width="100" align="right" />
          <ElTableColumn label="金额" width="150" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.amount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="已付" width="150" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.paid) }}</template>
          </ElTableColumn>
          <ElTableColumn label="未付" width="150" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.unpaid) }}</template>
          </ElTableColumn>
          <ElTableColumn label="占比" width="160">
            <template #default="{ row }">
              <div class="summary-percent">
                <ElProgress
                  :percentage="Number((row.percent * 100).toFixed(1))"
                  :show-text="false"
                  :stroke-width="6"
                  class="flex-1"
                />
                <span class="summary-percent__text">{{ (row.percent * 100).toFixed(1) }}%</span>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <ItemTable
        v-else
        :data="pagedItems"
        selectable
        :show-edit="false"
        :pagination="{ current: page, size: pageSize, total: filteredItems.length }"
        @view="openDetail"
        @delete="handleDelete"
        @selection-change="(rows) => (selectedRows = rows)"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ElCard>

    <ItemDetailDrawer v-model="detailVisible" :item="detailItem" :editable="false" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as XLSX from 'xlsx'
  import ItemTable from '@/components/business/renovation/item-table/index.vue'
  import ItemDetailDrawer from '@/components/business/renovation/item-detail-drawer/index.vue'
  import {
    categoryTree,
    getCategoryFullLabel,
    hardTree,
    isUnderCategory,
    softTree
  } from '@/config/taxonomy'
  import { formatMoney, ITEM_STATUS_OPTIONS, today } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { ItemStatus, RenovationItem, SideType } from '@/types/renovation'
  import type { CategoryNode } from '@/config/taxonomy'

  defineOptions({ name: 'RenovationSummary' })

  interface SummaryRow {
    key: string
    label: string
    level: number
    count: number
    amount: number
    paid: number
    unpaid: number
    percent: number
    children?: SummaryRow[]
  }

  const store = useRenovationStore()

  const side = ref<SideType | 'all'>('all')
  const view = ref<'tree' | 'list'>('tree')
  const keyword = ref('')
  const roomId = ref('')
  const status = ref<ItemStatus | ''>('')
  const page = ref(1)
  const pageSize = ref(20)
  const selectedRows = ref<RenovationItem[]>([])
  const detailVisible = ref(false)
  const detailItem = ref<RenovationItem | null>(null)

  /** 汇总按「计入预算的条目」统计；子项明细在条目详情里查看，避免整体价被双算 */
  const filteredItems = computed(() =>
    store.billableItems.filter((item) => {
      if (side.value !== 'all' && item.side !== side.value) return false
      if (roomId.value && item.roomId !== roomId.value) return false
      if (status.value && item.status !== status.value) return false
      if (keyword.value) {
        const text = [item.name, item.brand, item.model, item.note].filter(Boolean).join(' ')
        if (!text.toLowerCase().includes(keyword.value.trim().toLowerCase())) return false
      }
      return true
    })
  )

  const detailCount = computed(() => store.items.length - store.billableItems.length)

  const summary = computed(() => {
    const list = filteredItems.value
    const amount = list.reduce((sum, item) => sum + item.amount, 0)
    const paid = list.reduce((sum, item) => sum + item.paidAmount, 0)
    return {
      count: list.length,
      amount,
      paid,
      unpaid: Math.max(amount - paid, 0),
      hard: list.filter((item) => item.side === 'hard').reduce((sum, item) => sum + item.amount, 0),
      soft: list.filter((item) => item.side === 'soft').reduce((sum, item) => sum + item.amount, 0),
      hardCount: list.filter((item) => item.side === 'hard').length,
      softCount: list.filter((item) => item.side === 'soft').length
    }
  })

  const sideTree = computed<CategoryNode[]>(() => {
    if (side.value === 'hard') return hardTree
    if (side.value === 'soft') return softTree
    return categoryTree
  })

  const treeRows = computed<SummaryRow[]>(() => {
    const list = filteredItems.value
    const total = summary.value.amount || 1
    const build = (nodes: CategoryNode[], level: number): SummaryRow[] => {
      const rows: SummaryRow[] = []
      nodes.forEach((node) => {
        const own = list.filter((item) => isUnderCategory(item.categoryKey, node.key))
        if (!own.length) return
        const amount = own.reduce((sum, item) => sum + item.amount, 0)
        const paid = own.reduce((sum, item) => sum + item.paidAmount, 0)
        const children = node.children ? build(node.children, level + 1) : []
        rows.push({
          key: node.key,
          label: node.label,
          level,
          count: own.length,
          amount,
          paid,
          unpaid: Math.max(amount - paid, 0),
          percent: amount / total,
          children: children.length ? children : undefined
        })
      })
      return rows
    }
    return build(sideTree.value, 1)
  })

  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  watch([side, keyword, roomId, status], () => {
    page.value = 1
    selectedRows.value = []
  })

  function handleSizeChange(size: number): void {
    pageSize.value = size
    page.value = 1
  }

  function handleCurrentChange(current: number): void {
    page.value = current
  }

  function openDetail(row: RenovationItem): void {
    detailItem.value = row
    detailVisible.value = true
  }

  async function handleDelete(row: RenovationItem): Promise<void> {
    const childCount = store.childrenOf(row.id).length
    const message = childCount
      ? `确定删除「${row.name}」吗？其下 ${childCount} 条子项明细会一并删除，且会直接删除源数据。`
      : `确定删除「${row.name}」吗？该操作会直接删除源数据。`
    try {
      await ElMessageBox.confirm(message, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeItem(row.id)
    ElMessage.success('已删除')
  }

  async function handleBatchDelete(): Promise<void> {
    const count = selectedRows.value.length
    if (!count) return
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${count} 条记录吗？其下的子项明细也会一并删除。`,
        '批量删除',
        {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        }
      )
    } catch {
      return
    }
    store.removeItems(selectedRows.value.map((item) => item.id))
    selectedRows.value = []
    ElMessage.success(`已删除 ${count} 条`)
  }

  function handleExport(): void {
    const rows = filteredItems.value.map((item) => ({
      分类: getCategoryFullLabel(item.categoryKey),
      名称: item.name,
      品牌: item.brand,
      型号规格: [item.model, item.spec].filter(Boolean).join(' '),
      房间: store.rooms.find((room) => room.id === item.roomId)?.name || '',
      数量: item.quantity,
      单位: item.unit,
      单价: item.unitPrice,
      金额: item.amount,
      状态: ITEM_STATUS_OPTIONS.find((option) => option.value === item.status)?.label || '',
      已付: item.paidAmount,
      备注: item.note
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 28 },
      { wch: 22 },
      { wch: 14 },
      { wch: 22 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 30 }
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '装修汇总')
    XLSX.writeFile(workbook, `装修汇总-${today()}.xlsx`)
    ElMessage.success('已导出 Excel')
  }
</script>

<style scoped lang="scss">
  .summary-page {
    gap: 12px;
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .stat-tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 18px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);

    &__label {
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__value {
      font-size: 22px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__value--primary {
      color: var(--art-primary);
    }

    &__sub {
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }

  .summary-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
  }

  .summary-card {
    margin-top: 0;

    :deep(.el-card__body) {
      height: 100%;
      padding: 0;
      overflow: hidden;
    }
  }

  .summary-tree {
    height: 100%;
    padding: 12px 16px 0;
  }

  .summary-percent {
    display: flex;
    gap: 8px;
    align-items: center;

    &__text {
      width: 44px;
      font-size: 12px;
      color: var(--art-gray-600);
      text-align: right;
    }
  }

  @media (width <= 900px) {
    .summary-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
