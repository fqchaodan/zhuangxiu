<!-- 录入工作台：左侧分类树 + 右侧表格，硬装 / 软装共用 -->
<template>
  <div class="workbench art-full-height">
    <div class="workbench__toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <ElButton type="primary" @click="openCreate">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          新增条目
        </ElButton>
        <ElInput
          v-model="keyword"
          placeholder="搜索名称 / 品牌 / 备注"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
          </template>
        </ElInput>
        <ElSelect
          v-model="roomId"
          placeholder="房间"
          clearable
          style="width: 128px"
          @change="handleSearch"
        >
          <ElOption v-for="room in rooms" :key="room.id" :label="room.name" :value="room.id" />
        </ElSelect>
        <ElSelect
          v-model="status"
          placeholder="状态"
          clearable
          style="width: 128px"
          @change="handleSearch"
        >
          <ElOption
            v-for="option in ITEM_STATUS_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
        <span class="workbench__stat"
          >共 {{ stat.count }} 条 · ¥ {{ formatMoney(stat.amount) }}</span
        >
      </div>

      <div class="flex items-center gap-2">
        <ElButton v-if="selectedRows.length" type="danger" plain @click="handleBatchDelete">
          删除选中 {{ selectedRows.length }} 条
        </ElButton>
      </div>
    </div>

    <div class="workbench__body">
      <ElCard class="tree-card" :body-style="{ padding: '0', height: '100%' }">
        <CategoryTree v-model="categoryKey" :side="side" :root-key="rootKey" :title="treeTitle" />
      </ElCard>

      <ElCard class="art-table-card">
        <ArtTableHeader layout="refresh,fullscreen" :loading="loading" @refresh="refreshData">
          <template #left>
            <span class="text-sm text-g-600"> {{ treeTitle }} · 当前筛选 {{ stat.count }} 条 </span>
          </template>
        </ArtTableHeader>

        <ItemTable
          :data="data"
          :loading="loading"
          selectable
          :pagination="pagination"
          @view="openDetail"
          @edit="openEdit"
          @delete="handleDelete"
          @selection-change="(rows) => (selectedRows = rows)"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </ElCard>
    </div>

    <ItemFormDialog
      v-model="formVisible"
      :item="editingItem"
      :default-category-key="defaultCategoryKey"
      :default-side="side"
      @saved="handleSaved"
    />

    <ItemDetailDrawer v-model="detailVisible" :item="detailItem" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import CategoryTree from '../category-tree/index.vue'
  import ItemTable from '../item-table/index.vue'
  import ItemFormDialog from '../item-form-dialog/index.vue'
  import ItemDetailDrawer from '../item-detail-drawer/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchItemPage, queryItems } from '@/api/local/item'
  import { formatMoney, ITEM_STATUS_OPTIONS } from '@/config/renovation-dict'
  import { getCategoryLabel } from '@/config/taxonomy'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { ItemStatus, RenovationItem, SideType } from '@/types/renovation'

  const props = defineProps<{
    side: SideType
    rootKey: string
  }>()

  defineOptions({ name: 'ItemWorkbench' })

  const store = useRenovationStore()
  const rooms = computed(() => store.rooms)
  const treeTitle = computed(() => getCategoryLabel(props.rootKey))

  const categoryKey = ref('')
  const keyword = ref('')
  const roomId = ref('')
  const status = ref<ItemStatus | ''>('')
  const selectedRows = ref<RenovationItem[]>([])

  const formVisible = ref(false)
  const editingItem = ref<RenovationItem | null>(null)
  const detailVisible = ref(false)
  const detailItem = ref<RenovationItem | null>(null)

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
      apiParams: {
        current: 1,
        size: 20,
        side: props.side,
        categoryKey: '',
        keyword: '',
        roomId: '',
        status: ''
      }
    },
    performance: {
      debounceTime: 300
    }
  })

  const stat = computed(() => {
    const list = queryItems({
      current: 1,
      size: 9999,
      side: props.side,
      categoryKey: categoryKey.value,
      keyword: keyword.value,
      roomId: roomId.value,
      status: status.value
    })
    return {
      count: list.length,
      amount: list.reduce((sum, item) => sum + item.amount, 0)
    }
  })

  const defaultCategoryKey = computed(() => (categoryKey.value ? categoryKey.value : props.rootKey))

  watch([categoryKey, roomId, status], () => {
    handleSearch()
  })

  // 切换分类子树时清空已选分类
  watch(
    () => props.rootKey,
    () => {
      categoryKey.value = ''
    }
  )

  function handleSearch(): void {
    Object.assign(searchParams, {
      current: 1,
      side: props.side,
      categoryKey: categoryKey.value,
      keyword: keyword.value.trim(),
      roomId: roomId.value,
      status: status.value
    })
    getData()
  }

  function openCreate(): void {
    editingItem.value = null
    formVisible.value = true
  }

  function openEdit(row: RenovationItem): void {
    editingItem.value = row
    formVisible.value = true
  }

  function openDetail(row: RenovationItem): void {
    detailItem.value = row
    detailVisible.value = true
  }

  function handleSaved(): void {
    refreshData()
  }

  async function handleDelete(row: RenovationItem): Promise<void> {
    try {
      await ElMessageBox.confirm(
        `确定删除「${row.name}」吗？删除后会同步从汇总中移除。`,
        '删除确认',
        { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    store.removeItem(row.id)
    ElMessage.success('已删除')
    refreshData()
  }

  async function handleBatchDelete(): Promise<void> {
    const count = selectedRows.value.length
    if (!count) return
    try {
      await ElMessageBox.confirm(`确定删除选中的 ${count} 条记录吗？`, '批量删除', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeItems(selectedRows.value.map((item) => item.id))
    selectedRows.value = []
    ElMessage.success(`已删除 ${count} 条`)
    refreshData()
  }
</script>

<style scoped lang="scss">
  .workbench {
    gap: 12px;

    &__toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--default-box-color);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
    }

    &__body {
      display: flex;
      flex: 1;
      gap: 12px;
      min-height: 0;
    }

    &__stat {
      font-size: 12px;
      color: var(--art-gray-600);
    }

    .tree-card {
      flex: 0 0 232px;
      width: 232px;
      margin-top: 0;
      border-radius: calc(var(--custom-radius) / 2 + 2px);

      :deep(.el-card__body) {
        height: 100%;
        overflow: hidden;
      }
    }

    :deep(.art-table-card) {
      flex: 1;
      min-width: 0;
      margin-top: 0;
    }
  }

  @media (width <= 900px) {
    .workbench__body {
      flex-direction: column;
    }

    .workbench .tree-card {
      flex: none;
      width: 100%;
      height: 240px;
    }
  }
</style>
