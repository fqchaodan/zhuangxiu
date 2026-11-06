<!-- 公司主材报价编辑 -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑主材' : '新增主材'"
    width="600px"
    append-to-body
  >
    <ElForm :model="form" label-width="92px">
      <ElFormItem label="所属公司" required>
        <ElSelect v-model="form.companyId" class="w-full">
          <ElOption
            v-for="company in store.companies"
            :key="company.id"
            :label="company.name"
            :value="company.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="主材分类" required>
        <ElCascader
          v-model="form.categoryPath"
          :options="categoryOptions"
          :props="cascaderProps"
          placeholder="主材 / 子类 / 细类"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="名称" required>
        <ElInput v-model="form.name" placeholder="如：厨房墙砖" maxlength="40" />
      </ElFormItem>
      <ElFormItem label="品牌 / 型号">
        <ElInput v-model="form.brand" placeholder="如：马可波罗 CH8866" maxlength="60" />
      </ElFormItem>
      <ElRow :gutter="12">
        <ElCol :span="12">
          <ElFormItem label="单价">
            <ElInputNumber v-model="form.price" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="单位">
            <ElInput v-model="form.unit" placeholder="㎡ / 樘 / 个" maxlength="8" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="规格说明">
        <ElInput v-model="form.spec" placeholder="尺寸、材质、颜色等" maxlength="80" />
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
  import { getCategoryNode, getCategoryPath, toCascaderOptions } from '@/config/taxonomy'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { CompanyItem } from '@/types/renovation'

  const props = defineProps<{
    modelValue: boolean
    item?: CompanyItem | null
    defaultCompanyId?: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const store = useRenovationStore()
  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })
  const isEdit = computed(() => Boolean(props.item?.id))

  const mainRoot = getCategoryNode('hard.main')

  const categoryOptions = toCascaderOptions(mainRoot?.children || [])

  const cascaderProps = {
    value: 'value',
    label: 'label',
    children: 'children',
    expandTrigger: 'hover' as const
  }

  const form = reactive({
    id: '',
    companyId: '',
    categoryPath: [] as string[],
    name: '',
    brand: '',
    spec: '',
    unit: '',
    price: 0,
    note: ''
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return
      Object.assign(form, {
        id: props.item?.id || '',
        companyId: props.item?.companyId || props.defaultCompanyId || store.companies[0]?.id || '',
        categoryPath: props.item
          ? getCategoryPath(props.item.categoryKey).map((node) => node.key)
          : [],
        name: props.item?.name || '',
        brand: [props.item?.brand, props.item?.model].filter(Boolean).join(' ') || '',
        spec: props.item?.spec || '',
        unit: props.item?.unit || '',
        price: props.item?.price || 0,
        note: props.item?.note || ''
      })
    }
  )

  function handleSubmit(): void {
    if (!form.companyId) {
      ElMessage.warning('请选择公司')
      return
    }
    const categoryKey = form.categoryPath[form.categoryPath.length - 1]
    if (!categoryKey) {
      ElMessage.warning('请选择主材分类')
      return
    }
    if (!form.name.trim()) {
      ElMessage.warning('请填写名称')
      return
    }
    store.upsertCompanyItem({
      id: form.id,
      companyId: form.companyId,
      kind: 'main',
      categoryKey,
      name: form.name.trim(),
      brand: form.brand,
      model: '',
      spec: form.spec,
      unit: form.unit,
      price: Number(form.price) || 0,
      included: true,
      coverage: 'full',
      note: form.note
    })
    ElMessage.success('已保存')
    visible.value = false
  }
</script>
