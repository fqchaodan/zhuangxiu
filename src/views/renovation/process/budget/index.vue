<!-- 预算与合同 -->
<template>
  <div class="budget-page">
    <div class="budget-stats">
      <div class="stat-tile">
        <span class="stat-tile__label">预算总额</span>
        <span class="stat-tile__value">¥ {{ formatMoney(store.budget.total) }}</span>
        <span class="stat-tile__sub">合同 ¥ {{ formatMoney(store.budget.contractAmount) }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">已发生</span>
        <span class="stat-tile__value">¥ {{ formatMoney(store.grandTotal) }}</span>
        <span class="stat-tile__sub">来自硬装 + 软装条目</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">剩余</span>
        <span class="stat-tile__value" :class="{ 'is-danger': remaining < 0 }">
          ¥ {{ formatMoney(remaining) }}
        </span>
        <span class="stat-tile__sub">{{ remaining < 0 ? '已超支' : '预算 − 已发生' }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">付款进度</span>
        <span class="stat-tile__value">{{ paidPercent }}%</span>
        <span class="stat-tile__sub">
          已付 ¥ {{ formatMoney(paidAmount) }} / {{ formatMoney(paymentTotal) }}
        </span>
      </div>
    </div>

    <ElRow :gutter="12">
      <ElCol :xs="24" :lg="10">
        <div class="art-card budget-card">
          <div class="budget-card__head">
            <span class="budget-card__title">预算与合同</span>
            <ElButton type="primary" size="small" @click="saveBudget">保存</ElButton>
          </div>

          <ElForm label-width="88px" label-position="left">
            <ElFormItem label="预算总额">
              <ElInputNumber v-model="form.total" :min="0" :precision="2" class="w-full" />
            </ElFormItem>
            <ElFormItem label="合同金额">
              <ElInputNumber v-model="form.contractAmount" :min="0" :precision="2" class="w-full" />
            </ElFormItem>
            <ElFormItem label="设计费">
              <ElInputNumber v-model="form.designFee" :min="0" :precision="2" class="w-full" />
            </ElFormItem>
            <ElFormItem label="管理费">
              <ElInputNumber v-model="form.managementFee" :min="0" :precision="2" class="w-full" />
            </ElFormItem>
            <ElFormItem label="开工日期">
              <ElDatePicker
                v-model="form.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                class="w-full"
              />
            </ElFormItem>
            <ElFormItem label="预计竣工">
              <ElDatePicker
                v-model="form.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                class="w-full"
              />
            </ElFormItem>
            <ElFormItem label="备注">
              <ElInput v-model="form.note" type="textarea" :rows="3" maxlength="200" />
            </ElFormItem>
          </ElForm>

          <ElAlert
            type="info"
            :closable="false"
            show-icon
            title="预算总额用于看板进度；合同金额用于付款节点按比例计算。"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="14">
        <div class="art-card budget-card budget-card--table">
          <div class="budget-card__head">
            <div>
              <span class="budget-card__title">付款节点</span>
              <span class="ml-2 text-xs text-g-500">共 {{ store.payments.length }} 个节点</span>
            </div>
            <div class="flex gap-2">
              <ElButton size="small" @click="recalcPayments">按合同比例重算</ElButton>
              <ElButton type="primary" size="small" @click="openCreate">新增节点</ElButton>
            </div>
          </div>

          <ElTable :data="store.payments" height="392" border>
            <ElTableColumn prop="name" label="节点" min-width="120" />
            <ElTableColumn label="比例" width="80" align="right">
              <template #default="{ row }">{{ (row.ratio * 100).toFixed(0) }}%</template>
            </ElTableColumn>
            <ElTableColumn label="金额" width="120" align="right">
              <template #default="{ row }">¥ {{ formatMoney(row.amount) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="dueDate" label="计划日期" width="110" />
            <ElTableColumn label="状态" width="100">
              <template #default="{ row }">
                <ElTag size="small" :type="paymentTag(row.status).type" effect="plain">
                  {{ paymentTag(row.status).label }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="104" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <ArtButtonTable type="edit" @click="openEdit(row)" />
                  <ArtButtonTable type="delete" @click="handleDelete(row)" />
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElCol>
    </ElRow>

    <PaymentDialog
      v-model="dialogVisible"
      :payment="editing"
      :contract-amount="store.budget.contractAmount || store.budget.total"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import PaymentDialog from './modules/payment-dialog.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { formatMoney } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { PaymentNode } from '@/types/renovation'

  defineOptions({ name: 'ProcessBudget' })

  const store = useRenovationStore()
  const dialogVisible = ref(false)
  const editing = ref<PaymentNode | null>(null)

  const form = reactive({
    total: 0,
    contractAmount: 0,
    designFee: 0,
    managementFee: 0,
    startDate: '',
    endDate: '',
    note: ''
  })

  watch(
    () => store.budget,
    (budget) => {
      Object.assign(form, {
        total: budget.total,
        contractAmount: budget.contractAmount,
        designFee: budget.designFee,
        managementFee: budget.managementFee,
        startDate: budget.startDate,
        endDate: budget.endDate,
        note: budget.note
      })
    },
    { immediate: true, deep: true }
  )

  const remaining = computed(() => store.budget.total - store.grandTotal)

  const paymentTotal = computed(() =>
    store.payments.reduce((sum, payment) => sum + payment.amount, 0)
  )
  const paidAmount = computed(() =>
    store.payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0)
  )
  const paidPercent = computed(() =>
    paymentTotal.value > 0 ? Math.round((paidAmount.value / paymentTotal.value) * 100) : 0
  )

  function saveBudget(): void {
    store.setBudget({
      total: Number(form.total) || 0,
      contractAmount: Number(form.contractAmount) || 0,
      designFee: Number(form.designFee) || 0,
      managementFee: Number(form.managementFee) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      note: form.note
    })
    ElMessage.success('预算已保存')
  }

  function paymentTag(status: PaymentNode['status']) {
    if (status === 'paid') return { label: '已支付', type: 'success' as const }
    if (status === 'partial') return { label: '部分支付', type: 'warning' as const }
    return { label: '未支付', type: 'info' as const }
  }

  function openCreate(): void {
    editing.value = null
    dialogVisible.value = true
  }

  function openEdit(payment: PaymentNode): void {
    editing.value = payment
    dialogVisible.value = true
  }

  async function handleDelete(payment: PaymentNode): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除付款节点「${payment.name}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removePayment(payment.id)
    ElMessage.success('已删除')
  }

  function recalcPayments(): void {
    const base = store.budget.contractAmount || store.budget.total
    if (base <= 0) {
      ElMessage.warning('请先填写合同金额或预算总额')
      return
    }
    store.payments.forEach((payment) => {
      store.upsertPayment({ ...payment, amount: Number((base * payment.ratio).toFixed(2)) })
    })
    ElMessage.success('已按合同比例重算金额')
  }
</script>

<style scoped lang="scss">
  .budget-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .budget-stats {
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

      &.is-danger {
        color: var(--el-color-danger);
      }
    }

    &__sub {
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }

  .budget-card {
    padding: 16px 18px;

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    &__title {
      font-size: 15px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &--table {
      :deep(.el-table) {
        border-radius: 8px;
      }
    }
  }

  @media (width <= 900px) {
    .budget-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
