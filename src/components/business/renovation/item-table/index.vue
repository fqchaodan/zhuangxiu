<!-- 装修条目表格：硬装 / 软装 / 汇总共用 -->
<template>
  <ArtTable
    :loading="loading"
    :data="data"
    :columns="columns"
    :pagination="pagination"
    :height="height"
    row-key="id"
    :tree-props="{ children: 'children' }"
    :default-expand-all="true"
    empty-text="还没有条目，先录一条试试"
    @selection-change="handleSelectionChange"
    @pagination:size-change="(size: number) => emit('size-change', size)"
    @pagination:current-change="(page: number) => emit('current-change', page)"
  >
    <template #categoryKey="{ row }">
      <div class="cell-category">
        <span class="cell-category__leaf">{{ getCategoryLabel(row.categoryKey) }}</span>
        <span class="cell-category__path">{{ categoryPathText(row.categoryKey) }}</span>
      </div>
    </template>

    <template #name="{ row }">
      <div class="cell-name">
        <div class="cell-name__title">
          <span>{{ row.name || '-' }}</span>
          <ElTag v-if="row.parentId" size="small" effect="plain" class="cell-name__tag">
            明细
          </ElTag>
          <ElTag
            v-else-if="row.children?.length"
            size="small"
            type="info"
            effect="plain"
            class="cell-name__tag"
          >
            {{ row.children.length }} 项明细
          </ElTag>
        </div>
        <span v-if="row.brand || row.model" class="cell-name__sub">
          {{ [row.brand, row.model].filter(Boolean).join(' · ') }}
        </span>
      </div>
    </template>

    <template #quantity="{ row }">
      <span>{{ row.quantity }}</span>
      <span class="ml-1 text-xs text-g-500">{{ row.unit }}</span>
    </template>

    <template #roomName="{ row }">
      <span>{{ roomName(row.roomId) }}</span>
    </template>

    <template #amount="{ row }">
      <div class="cell-amount-wrap">
        <span class="cell-amount">{{ formatMoney(row.amount) }}</span>
        <span v-if="row.parentId && !row.countInTotal" class="cell-amount__tip">不计价</span>
      </div>
    </template>

    <template #status="{ row }">
      <ElTag :type="statusMeta(row.status)?.type" size="small" effect="light">
        {{ statusMeta(row.status)?.label }}
      </ElTag>
    </template>

    <template #payStatus="{ row }">
      <div class="cell-pay">
        <ElTag :type="payMeta(row.payStatus)?.type" size="small" effect="plain">
          {{ payMeta(row.payStatus)?.label }}
        </ElTag>
        <span v-if="row.paidAmount" class="cell-pay__amount"
          >已付 {{ formatMoney(row.paidAmount) }}</span
        >
      </div>
    </template>

    <template #updatedAt="{ row }">
      <span class="text-xs text-g-500">{{ formatDateTime(row.updatedAt) }}</span>
    </template>

    <template #action="{ row }">
      <div class="table-actions">
        <ArtButtonTable type="view" @click="emit('view', row)" />
        <ArtButtonTable
          v-if="showAddChild && !readonly && !row.parentId"
          type="add"
          @click="emit('add-child', row)"
        />
        <ArtButtonTable v-if="showEdit && !readonly" type="edit" @click="emit('edit', row)" />
        <ArtButtonTable v-if="showDelete && !readonly" type="delete" @click="emit('delete', row)" />
      </div>
    </template>
  </ArtTable>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { getCategoryLabel, getCategoryPath } from '@/config/taxonomy'
  import { useRenovationStore } from '@/store/modules/renovation'
  import {
    formatDateTime,
    formatMoney,
    getDictMeta,
    ITEM_STATUS_OPTIONS,
    PAY_STATUS_OPTIONS
  } from '@/config/renovation-dict'
  import type { ItemRow, RenovationItem } from '@/types/renovation'
  import type { ColumnOption } from '@/types'

  const props = withDefaults(
    defineProps<{
      data: ItemRow[]
      loading?: boolean
      readonly?: boolean
      selectable?: boolean
      showEdit?: boolean
      showDelete?: boolean
      showAddChild?: boolean
      height?: string
      pagination?: { current: number; size: number; total: number }
    }>(),
    {
      loading: false,
      readonly: false,
      selectable: false,
      showEdit: true,
      showDelete: true,
      showAddChild: false,
      height: undefined,
      pagination: undefined
    }
  )

  const emit = defineEmits<{
    (e: 'view', row: RenovationItem): void
    (e: 'edit', row: RenovationItem): void
    (e: 'delete', row: RenovationItem): void
    (e: 'add-child', row: ItemRow): void
    (e: 'selection-change', rows: RenovationItem[]): void
    (e: 'size-change', size: number): void
    (e: 'current-change', page: number): void
  }>()

  const statusMeta = (value: RenovationItem['status']) => getDictMeta(ITEM_STATUS_OPTIONS, value)
  const payMeta = (value: RenovationItem['payStatus']) => getDictMeta(PAY_STATUS_OPTIONS, value)

  /** 操作列尺寸：按钮 34px、按钮间距 8px、单元格左右内边距 12px × 2 加 4px 余量 */
  const ACTION_BUTTON_WIDTH = 34
  const ACTION_BUTTON_GAP = 8
  const ACTION_CELL_PADDING = 28

  /** 按钮数量随只读 / 显隐变化，列宽跟着调整，避免固定宽度把按钮裁掉 */
  const actionWidth = computed(() => {
    const count =
      1 +
      Number(props.showAddChild && !props.readonly) +
      Number(props.showEdit && !props.readonly) +
      Number(props.showDelete && !props.readonly)
    return count * ACTION_BUTTON_WIDTH + (count - 1) * ACTION_BUTTON_GAP + ACTION_CELL_PADDING
  })

  const store = useRenovationStore()

  function roomName(roomId: string): string {
    if (!roomId) return '-'
    return store.rooms.find((room) => room.id === roomId)?.name || '-'
  }

  /** 分类路径只取主类 + 子类，避免单元格过宽 */
  function categoryPathText(key: string): string {
    const path = getCategoryPath(key)
    return path
      .slice(0, -1)
      .map((item) => item.label)
      .join(' / ')
  }

  const columns = computed<ColumnOption[]>(() => {
    const list: ColumnOption[] = []
    if (props.selectable) {
      list.push({ type: 'selection', width: 44, fixed: 'left' })
    }
    list.push(
      { prop: 'categoryKey', label: '分类', minWidth: 150, useSlot: true },
      { prop: 'name', label: '名称 / 品牌', minWidth: 180, useSlot: true },
      { prop: 'roomName', label: '房间', width: 80, useSlot: true },
      { prop: 'quantity', label: '数量', width: 90, useSlot: true, align: 'right' },
      {
        prop: 'unitPrice',
        label: '单价',
        width: 100,
        align: 'right',
        formatter: (row: RenovationItem) => formatMoney(row.unitPrice)
      },
      { prop: 'amount', label: '金额', width: 110, align: 'right', useSlot: true },
      { prop: 'status', label: '状态', width: 90, useSlot: true },
      { prop: 'payStatus', label: '付款', width: 120, useSlot: true },
      { prop: 'action', label: '操作', width: actionWidth.value, fixed: 'right', useSlot: true }
    )
    return list
  })

  function handleSelectionChange(rows: RenovationItem[]): void {
    emit('selection-change', rows)
  }
</script>

<style scoped lang="scss">
  // 单元格内容统一垂直居中；同时把树形缩进占位与展开图标变成 flex item，
  // 不再被块级内容挤到「中央空调」上方单独占一行
  :deep(.el-table__body-wrapper .el-table__cell .cell) {
    display: flex;
    align-items: center;
  }

  // 改成 flex 后右对齐列需要显式右对齐，否则数字会跑到左侧
  :deep(.el-table__body-wrapper .el-table__cell.is-right .cell) {
    justify-content: flex-end;
  }

  // 展开图标与分类主标题同一水平线，而不是落在两行文字中间
  :deep(.el-table__body-wrapper .el-table__expand-icon) {
    align-self: flex-start;
    margin-top: 3px;
  }

  // 树形缩进占位不许被压缩，保证父子层级一眼可辨
  :deep(.el-table__body-wrapper .el-table__placeholder) {
    flex: none;
  }

  .cell-category,
  .cell-name {
    min-width: 0;
  }

  .cell-category {
    display: flex;
    flex-direction: column;
    line-height: 1.35;

    &__leaf {
      font-size: 13px;
      color: var(--art-gray-800);
    }

    &__path {
      font-size: 11px;
      color: var(--art-gray-500);
    }
  }

  .cell-name {
    display: flex;
    flex-direction: column;
    line-height: 1.35;

    &__title {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: var(--art-gray-900);

      > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__tag {
      flex: none;
      height: 18px;
      padding: 0 5px;
      font-size: 11px;
      line-height: 16px;
    }

    &__sub {
      overflow: hidden;
      font-size: 11px;
      color: var(--art-gray-500);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cell-amount {
    font-weight: 500;
    color: var(--art-gray-900);
  }

  .cell-amount-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.35;
  }

  .cell-amount__tip {
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .cell-pay {
    display: flex;
    flex-direction: column;
    gap: 2px;

    &__amount {
      font-size: 11px;
      color: var(--art-gray-500);
    }
  }
</style>
