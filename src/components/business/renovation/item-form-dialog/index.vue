<!-- 条目新增 / 编辑弹窗（硬装、软装共用） -->
<template>
  <ElDialog
    v-model="visible"
    :title="dialogTitle"
    width="80%"
    top="10vh"
    class="item-form-dialog"
    body-class="item-form-dialog__body"
    destroy-on-close
    append-to-body
  >
    <div v-if="parentItem" class="parent-tip">
      <ArtSvgIcon icon="ri:information-line" />
      <span>
        将作为「{{ parentItem.name }}」的子项新增；子项默认只记录组成明细，金额不重复计入总预算
      </span>
    </div>

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="所属分类" prop="categoryPath">
            <ElCascader
              ref="cascaderRef"
              v-model="form.categoryPath"
              :options="cascaderOptions"
              :props="cascaderProps"
              placeholder="请选择分类（可停在任意层级）"
              class="w-full"
              @change="handleCategoryChange"
            />
            <div class="form-tip">
              可停在任意层级：如整套「中央空调」是一个整体价，直接选到中央空调即可
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="quickCategories.length" :span="24">
          <ElFormItem label="快速归类">
            <div class="quick-tags">
              <ElTag
                v-for="node in quickCategories"
                :key="node.key"
                :effect="currentCategoryKey === node.key ? 'dark' : 'plain'"
                class="quick-tag"
                @click="applyQuickCategory(node)"
              >
                {{ node.label }}
              </ElTag>
            </div>
            <div class="form-tip">点击直接带入该细类，名称、单位可再修改</div>
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
        <ElCol v-if="form.parentId" :span="24">
          <ElFormItem label="预算计价">
            <div class="count-switch">
              <ElSwitch v-model="form.countInTotal" active-text="子项金额计入总预算" />
              <span class="form-tip">
                默认关闭：整体价已在父条目记录，子项只作组成明细；若是额外增项可打开
              </span>
            </div>
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
  import type { CategoryNode } from '@/config/taxonomy'
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
      /** 从某个条目「添加子项」进来时传入 */
      parentItem?: RenovationItem | null
      defaultCategoryKey?: string
      defaultSide?: SideType
    }>(),
    {
      item: null,
      parentItem: null,
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
  const cascaderRef = ref<{ togglePopperVisible: (visible?: boolean) => void } | null>(null)
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
    parentId: string
    countInTotal: boolean
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
      parentId: '',
      countInTotal: false,
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

  const dialogTitle = computed(() => {
    if (isEdit.value) return form.parentId ? '编辑子项' : '编辑条目'
    return props.parentItem ? '新增子项' : '新增条目'
  })

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
    expandTrigger: 'hover' as const,
    /** 允许选到分类树的任意层级，整体价可直接挂在「中央空调」上 */
    checkStrictly: true,
    /** 严格模式下点击节点本身就选中，不必去点左侧的单选圈 */
    checkOnClickNode: true
  }

  const cascaderSide = computed<SideType>(() => {
    if (props.item) return getSideOf(props.item.categoryKey)
    if (props.parentItem) return getSideOf(props.parentItem.categoryKey)
    return props.defaultSide
  })

  const cascaderOptions = computed(() =>
    toCascaderOptions(cascaderSide.value === 'soft' ? softTree : hardTree)
  )

  /** 父条目分类下的直接细类，供「添加子项」时一键带入 */
  const quickCategories = computed<CategoryNode[]>(() => {
    const key = props.parentItem?.categoryKey
    if (!key) return []
    return getCategoryNode(key)?.children ?? []
  })

  const currentCategoryKey = computed(() => {
    const path = form.categoryPath || []
    return path[path.length - 1] || ''
  })

  function applyQuickCategory(node: CategoryNode): void {
    form.categoryPath = getCategoryPath(node.key).map((item) => item.key)
    form.name = node.label
    form.unit = node.unit || '项'
  }

  function handleCategoryChange(value: unknown): void {
    const keys = Array.isArray(value) ? (value as string[]) : []
    const key = keys[keys.length - 1]
    if (!key) return
    form.unit = getCategoryUnit(key)
    // 严格模式下 Element Plus 不会自动收起面板，选中后主动收起
    cascaderRef.value?.togglePopperVisible(false)
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
          parentId: item.parentId || '',
          countInTotal: item.countInTotal ?? false,
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
      } else if (props.parentItem) {
        // 子项默认继承父条目的分类与采购信息，避免整套设备重复录入
        const parent = props.parentItem
        Object.assign(form, {
          parentId: parent.id,
          categoryPath: getCategoryPath(parent.categoryKey).map((node) => node.key),
          roomId: parent.roomId,
          vendorId: parent.vendorId,
          channel: parent.channel,
          orderDate: parent.orderDate,
          installDate: parent.installDate,
          warranty: parent.warranty
        })
      } else if (props.defaultCategoryKey) {
        const node = getCategoryNode(props.defaultCategoryKey)
        // 中间层级同样可以挂条目（整套设备按整体价记录）
        if (node) {
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

    const categoryKey = currentCategoryKey.value
    if (!categoryKey) {
      ElMessage.warning('请选择分类')
      return
    }

    saving.value = true
    try {
      const payload = {
        id: form.id || undefined,
        parentId: form.parentId,
        countInTotal: form.parentId ? form.countInTotal : false,
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
      ElMessage.success(isEdit.value ? '已保存修改' : form.parentId ? '已新增子项' : '已新增条目')
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

  .parent-tip {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 14px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--art-gray-700);
    background: var(--el-color-primary-light-9);
    border-radius: 6px;
  }

  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .quick-tag {
    cursor: pointer;
  }

  .count-switch {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;

    .form-tip {
      margin-top: 0;
    }
  }
</style>

<!-- 弹窗通过 Teleport 挂到 body，scoped 样式无法命中，这里单独写全局样式 -->
<style lang="scss">
  /* 占屏幕 80% 宽、80% 高（上下各留 10%）；表单区内部滚动，页脚固定 */
  .item-form-dialog.el-dialog {
    display: flex;
    flex-direction: column;
    height: 80vh;
    min-height: 560px;
    margin-bottom: 0;

    .el-dialog__header,
    .el-dialog__footer {
      flex: none;
    }

    .item-form-dialog__body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }

  /* 矮屏下 80vh 已经很小，去掉最小高度避免弹窗溢出视口 */
  @media (height <= 700px) {
    .item-form-dialog.el-dialog {
      min-height: 0;
    }
  }
</style>
