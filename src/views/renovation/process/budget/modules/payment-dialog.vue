<!-- 付款节点编辑 -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑付款节点' : '新增付款节点'"
    width="520px"
    append-to-body
  >
    <ElForm :model="form" label-width="86px">
      <ElFormItem label="节点名称" required>
        <ElInput v-model="form.name" placeholder="如：水电验收款" maxlength="30" />
      </ElFormItem>
      <ElFormItem label="付款比例">
        <ElInputNumber
          v-model="form.ratioPercent"
          :min="0"
          :max="100"
          :precision="1"
          class="w-full"
          @change="handleRatioChange"
        >
          <template #suffix>%</template>
        </ElInputNumber>
        <div class="form-tip">按合同金额的百分比自动计算金额</div>
      </ElFormItem>
      <ElFormItem label="金额">
        <ElInputNumber v-model="form.amount" :min="0" :precision="2" class="w-full" />
      </ElFormItem>
      <ElFormItem label="计划日期">
        <ElDatePicker
          v-model="form.dueDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="实付日期">
        <ElDatePicker
          v-model="form.paidDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="form.status" class="w-full">
          <ElOption label="未支付" value="unpaid" />
          <ElOption label="部分支付" value="partial" />
          <ElOption label="已支付" value="paid" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="form.note" type="textarea" :rows="2" maxlength="120" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { PaymentNode } from '@/types/renovation'

  const props = defineProps<{
    modelValue: boolean
    payment?: PaymentNode | null
    contractAmount: number
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const store = useRenovationStore()
  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })
  const isEdit = computed(() => Boolean(props.payment?.id))

  const form = reactive({
    id: '',
    name: '',
    ratioPercent: 0,
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'unpaid' as PaymentNode['status'],
    note: ''
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return
      Object.assign(form, {
        id: props.payment?.id || '',
        name: props.payment?.name || '',
        ratioPercent: Number(((props.payment?.ratio || 0) * 100).toFixed(1)),
        amount: props.payment?.amount || 0,
        dueDate: props.payment?.dueDate || '',
        paidDate: props.payment?.paidDate || '',
        status: props.payment?.status || 'unpaid',
        note: props.payment?.note || ''
      })
    }
  )

  function handleRatioChange(value: number | undefined): void {
    const ratio = Number(value || 0)
    form.amount = Number(((props.contractAmount * ratio) / 100).toFixed(2))
  }

  function handleSubmit(): void {
    if (!form.name.trim()) {
      ElMessage.warning('请填写节点名称')
      return
    }
    store.upsertPayment({
      id: form.id,
      name: form.name.trim(),
      ratio: Number((Number(form.ratioPercent) / 100).toFixed(4)),
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate,
      paidDate: form.paidDate,
      status: form.status,
      note: form.note
    })
    ElMessage.success('已保存')
    visible.value = false
  }
</script>

<style scoped lang="scss">
  .form-tip {
    margin-top: 2px;
    font-size: 12px;
    color: var(--art-gray-500);
  }
</style>
