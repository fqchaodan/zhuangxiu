<!-- 条目详情抽屉（含子项明细管理） -->
<template>
  <ElDrawer v-model="visible" title="条目详情" size="480px" append-to-body>
    <template v-if="item">
      <div class="detail-head">
        <div class="detail-head__title">{{ item.name }}</div>
        <div class="detail-head__sub">{{ getCategoryFullLabel(item.categoryKey) }}</div>
        <div class="detail-head__amount">¥ {{ formatMoney(item.amount) }}</div>
      </div>

      <ElDescriptions :column="1" border size="small" class="mt-4">
        <ElDescriptionsItem label="品牌">{{ item.brand || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="型号 / 规格">
          {{ [item.model, item.spec].filter(Boolean).join(' · ') || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="房间">{{ roomName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="数量"> {{ item.quantity }} {{ item.unit }} </ElDescriptionsItem>
        <ElDescriptionsItem label="单价">¥ {{ formatMoney(item.unitPrice) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="供应商">{{ vendorName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="采购渠道">{{ channelLabel }}</ElDescriptionsItem>
        <ElDescriptionsItem label="条目状态">
          <ElTag :type="statusMeta?.type" size="small" effect="light">{{
            statusMeta?.label
          }}</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="付款状态">
          <ElTag :type="payMeta?.type" size="small" effect="plain">{{ payMeta?.label }}</ElTag>
          <span class="ml-2 text-xs text-g-500">已付 ¥ {{ formatMoney(item.paidAmount) }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="下单日期">{{ item.orderDate || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="安装日期">{{ item.installDate || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="质保">{{ item.warranty || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="备注">{{ item.note || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="最后更新">{{
          formatDateTime(item.updatedAt)
        }}</ElDescriptionsItem>
      </ElDescriptions>

      <div v-if="item.parentId" class="parent-block">
        <div class="parent-block__label">所属条目</div>
        <div class="parent-block__body">
          <span>{{ parentItem?.name || '-' }}</span>
          <ElTag :type="item.countInTotal ? 'warning' : 'info'" size="small" effect="plain">
            {{ item.countInTotal ? '金额计入总预算' : '金额仅作明细' }}
          </ElTag>
        </div>
      </div>

      <div v-else class="children-block">
        <div class="children-block__head">
          <span class="children-block__title">子项明细（{{ children.length }}）</span>
          <ElButton v-if="editable" size="small" type="primary" plain @click="openAddChild">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            添加子项
          </ElButton>
        </div>
        <p class="children-block__tip">
          子项只记录组成明细，金额默认不重复计入总预算；如需单独计价，可在编辑时打开开关。
        </p>

        <div v-if="children.length" class="children-list">
          <div v-for="child in children" :key="child.id" class="child-row">
            <div class="child-row__main">
              <span class="child-row__name">{{ child.name }}</span>
              <span class="child-row__sub">
                {{ getCategoryLabel(child.categoryKey) }} · {{ child.quantity }} {{ child.unit }}
                <template v-if="child.model"> · {{ child.model }}</template>
              </span>
            </div>
            <div class="child-row__side">
              <span>¥ {{ formatMoney(child.amount) }}</span>
              <ElTag :type="child.countInTotal ? 'warning' : 'info'" size="small" effect="plain">
                {{ child.countInTotal ? '计价' : '明细' }}
              </ElTag>
            </div>
            <div v-if="editable" class="child-row__actions">
              <ElButton link size="small" @click="openEditChild(child)">编辑</ElButton>
              <ElButton link size="small" type="danger" @click="removeChild(child)">删除</ElButton>
            </div>
          </div>
        </div>
        <ElEmpty v-else description="还没有子项明细" :image-size="60" />
      </div>
    </template>

    <ItemFormDialog
      v-model="childFormVisible"
      :item="editingChild"
      :parent-item="item"
      @saved="handleChildSaved"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ItemFormDialog from '../item-form-dialog/index.vue'
  import { getCategoryFullLabel, getCategoryLabel } from '@/config/taxonomy'
  import {
    CHANNEL_OPTIONS,
    formatDateTime,
    formatMoney,
    getDictMeta,
    ITEM_STATUS_OPTIONS,
    PAY_STATUS_OPTIONS
  } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { RenovationItem } from '@/types/renovation'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      item: RenovationItem | null
      /** 汇总页是只读视图，传 false 隐藏子项操作 */
      editable?: boolean
    }>(),
    { editable: true }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'changed'): void
  }>()

  const store = useRenovationStore()
  const childFormVisible = ref(false)
  const editingChild = ref<RenovationItem | null>(null)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const children = computed(() => (props.item ? store.childrenOf(props.item.id) : []))
  const parentItem = computed(() => {
    const id = props.item?.parentId
    return id ? store.items.find((item) => item.id === id) || null : null
  })

  const roomName = computed(
    () => store.rooms.find((room) => room.id === props.item?.roomId)?.name || '-'
  )
  const vendorName = computed(
    () => store.vendors.find((vendor) => vendor.id === props.item?.vendorId)?.name || '-'
  )
  const statusMeta = computed(() => getDictMeta(ITEM_STATUS_OPTIONS, props.item?.status || 'todo'))
  const payMeta = computed(() => getDictMeta(PAY_STATUS_OPTIONS, props.item?.payStatus || 'unpaid'))
  const channelLabel = computed(
    () => getDictMeta(CHANNEL_OPTIONS, props.item?.channel || 'market')?.label || '-'
  )

  function openAddChild(): void {
    editingChild.value = null
    childFormVisible.value = true
  }

  function openEditChild(child: RenovationItem): void {
    editingChild.value = child
    childFormVisible.value = true
  }

  function handleChildSaved(): void {
    emit('changed')
  }

  async function removeChild(child: RenovationItem): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除子项「${child.name}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeItem(child.id)
    ElMessage.success('已删除子项')
    emit('changed')
  }
</script>

<style scoped lang="scss">
  .detail-head {
    padding: 14px 16px;
    background: var(--art-gray-100);
    border-radius: 8px;

    &__title {
      font-size: 16px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__amount {
      margin-top: 10px;
      font-size: 22px;
      font-weight: 500;
      color: var(--art-primary);
    }
  }

  .parent-block {
    padding: 12px 14px;
    margin-top: 16px;
    background: var(--art-gray-100);
    border-radius: 8px;

    &__label {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__body {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 13px;
      color: var(--art-gray-800);
    }
  }

  .children-block {
    margin-top: 18px;

    &__head {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }

    &__title {
      font-size: 14px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__tip {
      margin: 6px 0 12px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--art-gray-500);
    }
  }

  .children-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .child-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid var(--art-gray-200);
    border-radius: 8px;

    &__main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 140px;
      line-height: 1.4;
    }

    &__name {
      font-size: 13px;
      color: var(--art-gray-900);
    }

    &__sub {
      font-size: 11px;
      color: var(--art-gray-500);
    }

    &__side {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: var(--art-gray-800);
    }

    &__actions {
      display: flex;
      gap: 2px;
    }
  }
</style>
