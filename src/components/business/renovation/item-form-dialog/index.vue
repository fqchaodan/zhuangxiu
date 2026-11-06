<!-- 条目新增 / 编辑弹窗（硬装、软装共用） -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑条目' : '新增条目'"
    width="760px"
    top="6vh"
    destroy-on-close
    append-to-body
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="所属分类" prop="categoryPath">
            <ElCascader
              v-model="form.categoryPath"
              :options="cascaderOptions"
              :props="cascaderProps"
              placeholder="请选择分类（主类 / 子类 / 细类）"
              class="w-full"
              @change="handleCategoryChange"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="form.name" placeholder="如：厨房墙砖" maxlength="60" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="房间">
            <ElSelect v-model="form.roomId" placeholder="选择空间" clearable class="w-full">
              <ElOption v-for="room in rooms" :key="room.id" :label="room.name" :value="room.id" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="品牌">
            <ElInput v-model="form.brand" placeholder="如：马可波罗" maxlength="40" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="型号 / 规格">
            <ElInput v-model="form.model" placeholder="型号、色号、尺寸" maxlength="60" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="数量" prop="quantity">
            <ElInputNumber v-model="form.quantity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="单位">
            <ElSelect v-model="form.unit" filterable allow-create class="w-full">
              <ElOption v-for="unit in UNIT_OPTIONS" :key="unit" :label="unit" :value="unit" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="单价">
            <ElInputNumber v-model="form.unitPrice" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="金额" prop="amount">
            <ElInputNumber
              v-model="form.amount"
              :min="0"
              :precision="2"
              class="w-full"
              @change="amountTouched = true"
            />
            <div class="form-tip">默认按「数量 × 单价」计算，可手动覆盖</div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="供应商">
            <ElSelect
              v-model="form.vendorId"
              placeholder="可在供应商通讯录维护"
              clearable
              filterable
              class="w-full"
            >
              <ElOption
                v-for="vendor in vendors"
                :key="vendor.id"
                :label="`${vendor.name}${vendor.company ? ' · ' + vendor.company : ''}`"
                :value="vendor.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="采购渠道">
            <ElSelect v-model="form.channel" class="w-full">
              <ElOption
                v-for="option in CHANNEL_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="条目状态">
            <ElSelect v-model="form.status" class="w-full">
              <ElOption
                v-for="option in ITEM_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="付款状态">
            <ElSelect v-model="form.payStatus" class="w-full">
              <ElOption
                v-for="option in PAY_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="已付金额">
            <ElInputNumber v-model="form.paidAmount" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="下单日期">
            <ElDatePicker
              v-model="form.orderDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              class="w-full"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="安装日期">
            <ElDatePicker
              v-model="form.installDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              class="w-full"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="质保">
            <ElInput v-model="form.warranty" placeholder="如：5 年 / 终身" maxlength="30" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="规格说明">
            <ElInput v-model="form.spec" placeholder="尺寸、材质、颜色等补充" maxlength="80" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="备注">
            <ElInput
              v-model="form.note"
              type="textarea"
              :rows="2"
              maxlength="200"
              show-word-limit
              placeholder="安装要求、与商家约定、验收注意事项"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getCategoryNode,
    getCategoryPath,
    getCategoryUnit,
    getSideOf,
    hardTree,
    softTree,
    toCascaderOptions
  } from '@/config/taxonomy'
  import {
    CHANNEL_OPTIONS,
    ITEM_STATUS_OPTIONS,
    PAY_STATUS_OPTIONS,
    UNIT_OPTIONS
  } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type {
    ChannelType,
    ItemStatus,
    PayStatus,
    RenovationItem,
    SideType
  } from '@/types/renovation'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      item?: RenovationItem | null
      defaultCategoryKey?: string
      defaultSide?: SideType
    }>(),
    {
      item: null,
      defaultCategoryKey: '',
      defaultSide: 'hard'
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved', item: RenovationItem): void
  }>()

  const store = useRenovationStore()
  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const amountTouched = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const isEdit = computed(() => Boolean(props.item?.id))

  const rooms = computed(() => store.rooms)
  const vendors = computed(() => store.vendors)

  interface FormState {
    id: string
    categoryPath: string[]
    name: string
    brand: string
    model: string
    spec: string
    roomId: string
    quantity: number
    unit: string
    unitPrice: number
    amount: number
    vendorId: string
    channel: ChannelType
    status: ItemStatus
    payStatus: PayStatus
    paidAmount: number
    orderDate: string
    installDate: string
    warranty: string
    note: string
  }

  function emptyForm(): FormState {
    return {
      id: '',
      categoryPath: [],
      name: '',
      brand: '',
      model: '',
      spec: '',
      roomId: '',
      quantity: 1,
      unit: '项',
      unitPrice: 0,
      amount: 0,
      vendorId: '',
      channel: 'market',
      status: 'todo',
      payStatus: 'unpaid',
      paidAmount: 0,
      orderDate: '',
      installDate: '',
      warranty: '',
      note: ''
    }
  }

  const form = reactive<FormState>(emptyForm())

  const rules: FormRules = {
    categoryPath: [{ required: true, message: '请选择分类', trigger: 'change' }],
    name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    quantity: [{ required: true, message: '请填写数量', trigger: 'blur' }],
    amount: [{ required: true, message: '请填写金额', trigger: 'blur' }]
  }

  const cascaderProps = {
    value: 'value',
    label: 'label',
    children: 'children',
    expandTrigger: 'hover' as const
  }

  const cascaderSide = computed<SideType>(() =>
    props.item ? getSideOf(props.item.categoryKey) : props.defaultSide
  )

  const cascaderOptions = computed(() =>
    toCascaderOptions(cascaderSide.value === 'soft' ? softTree : hardTree)
  )

  function handleCategoryChange(value: unknown): void {
    const keys = Array.isArray(value) ? (value as string[]) : []
    const key = keys[keys.length - 1]
    if (key) form.unit = getCategoryUnit(key)
  }

  /** 数量 / 单价变化时联动金额 */
  watch(
    () => [form.quantity, form.unitPrice],
    () => {
      if (amountTouched.value) return
      form.amount = Number((Number(form.quantity || 0) * Number(form.unitPrice || 0)).toFixed(2))
    }
  )

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return
      amountTouched.value = Boolean(props.item)
      Object.assign(form, emptyForm())
      if (props.item) {
        const item = props.item
        Object.assign(form, {
          id: item.id,
          categoryPath: getCategoryPath(item.categoryKey).map((node) => node.key),
          name: item.name,
          brand: item.brand,
          model: item.model,
          spec: item.spec,
          roomId: item.roomId,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          amount: item.amount,
          vendorId: item.vendorId,
          channel: item.channel,
          status: item.status,
          payStatus: item.payStatus,
          paidAmount: item.paidAmount,
          orderDate: item.orderDate,
          installDate: item.installDate,
          warranty: item.warranty,
          note: item.note
        })
      } else if (props.defaultCategoryKey) {
        const node = getCategoryNode(props.defaultCategoryKey)
        // 只有选中的是末级分类时才预填，避免保存到中间节点
        if (node && !node.children?.length) {
          form.categoryPath = getCategoryPath(props.defaultCategoryKey).map((item) => item.key)
          form.unit = getCategoryUnit(props.defaultCategoryKey)
        }
      }
    },
    { immediate: true }
  )

  async function handleSubmit(): Promise<void> {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    const categoryKey = form.categoryPath[form.categoryPath.length - 1]
    if (!categoryKey) {
      ElMessage.warning('请选择到最末级分类')
      return
    }

    saving.value = true
    try {
      const payload = {
        id: form.id || undefined,
        side: getSideOf(categoryKey),
        categoryKey,
        name: form.name,
        brand: form.brand,
        model: form.model,
        spec: form.spec,
        roomId: form.roomId,
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        unitPrice: Number(form.unitPrice) || 0,
        amount: Number(form.amount) || 0,
        vendorId: form.vendorId,
        channel: form.channel,
        status: form.status,
        payStatus: form.payStatus,
        paidAmount: Number(form.paidAmount) || 0,
        orderDate: form.orderDate || '',
        installDate: form.installDate || '',
        warranty: form.warranty,
        note: form.note
      }
      const saved = store.upsertItem(payload)
      ElMessage.success(isEdit.value ? '已保存修改' : '已新增条目')
      emit('saved', saved)
      visible.value = false
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .form-tip {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--art-gray-500);
  }
</style>
