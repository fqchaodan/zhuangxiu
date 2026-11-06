<!-- 装修公司档案编辑 -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑公司' : '新增公司'"
    width="680px"
    append-to-body
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="公司名称" prop="name">
            <ElInput v-model="form.name" placeholder="如：鸿鹄设计" maxlength="40" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="承包模式">
            <ElSelect v-model="form.type" class="w-full">
              <ElOption label="全包" value="全包" />
              <ElOption label="半包" value="半包" />
              <ElOption label="清包" value="清包" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="报价总额">
            <ElInputNumber v-model="form.quoteTotal" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="工期（天）">
            <ElInputNumber v-model="form.durationDays" :min="0" class="w-full" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="主材小计">
            <ElInputNumber v-model="form.mainTotal" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="辅材小计">
            <ElInputNumber v-model="form.auxTotal" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="人工费">
            <ElInputNumber v-model="form.laborTotal" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="管理费">
            <ElInputNumber v-model="form.managementTotal" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="质保">
            <ElInput v-model="form.warranty" placeholder="如：整体 2 年，防水 5 年" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="评分">
            <ElRate v-model="form.rating" :max="5" allow-half />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="联系人">
            <ElInput v-model="form.contact" placeholder="姓名" maxlength="20" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系电话">
            <ElInput v-model="form.phone" placeholder="手机号" maxlength="20" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="优势">
            <ElInput
              v-model="form.prosText"
              type="textarea"
              :rows="4"
              placeholder="一行一条，如：辅材档次高"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="劣势 / 风险">
            <ElInput
              v-model="form.consText"
              type="textarea"
              :rows="4"
              placeholder="一行一条，如：未列瓷砖背胶"
            />
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
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { Company } from '@/types/renovation'

  const props = defineProps<{
    modelValue: boolean
    company?: Company | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
  }>()

  const store = useRenovationStore()
  const formRef = ref<FormInstance>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })
  const isEdit = computed(() => Boolean(props.company?.id))

  const form = reactive({
    id: '',
    name: '',
    type: '半包',
    quoteTotal: 0,
    mainTotal: 0,
    auxTotal: 0,
    laborTotal: 0,
    managementTotal: 0,
    durationDays: 0,
    warranty: '',
    rating: 0,
    contact: '',
    phone: '',
    note: '',
    prosText: '',
    consText: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请填写公司名称', trigger: 'blur' }]
  }

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) return
      const company = props.company
      Object.assign(form, {
        id: company?.id || '',
        name: company?.name || '',
        type: company?.type || '半包',
        quoteTotal: company?.quoteTotal || 0,
        mainTotal: company?.mainTotal || 0,
        auxTotal: company?.auxTotal || 0,
        laborTotal: company?.laborTotal || 0,
        managementTotal: company?.managementTotal || 0,
        durationDays: company?.durationDays || 0,
        warranty: company?.warranty || '',
        rating: company?.rating || 0,
        contact: company?.contact || '',
        phone: company?.phone || '',
        note: company?.note || '',
        prosText: (company?.pros || []).join('\n'),
        consText: (company?.cons || []).join('\n')
      })
    }
  )

  async function handleSubmit(): Promise<void> {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    store.upsertCompany({
      id: form.id,
      name: form.name,
      type: form.type,
      quoteTotal: Number(form.quoteTotal) || 0,
      mainTotal: Number(form.mainTotal) || 0,
      auxTotal: Number(form.auxTotal) || 0,
      laborTotal: Number(form.laborTotal) || 0,
      managementTotal: Number(form.managementTotal) || 0,
      durationDays: Number(form.durationDays) || 0,
      warranty: form.warranty,
      rating: Number(form.rating) || 0,
      contact: form.contact,
      phone: form.phone,
      note: form.note,
      pros: form.prosText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      cons: form.consText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    })
    ElMessage.success('已保存')
    emit('saved')
    visible.value = false
  }
</script>
