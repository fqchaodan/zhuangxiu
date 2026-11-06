<!-- 条目详情抽屉（只读） -->
<template>
  <ElDrawer v-model="visible" title="条目详情" size="440px" append-to-body>
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
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getCategoryFullLabel } from '@/config/taxonomy'
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

  const props = defineProps<{
    modelValue: boolean
    item: RenovationItem | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const store = useRenovationStore()

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
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
</style>
