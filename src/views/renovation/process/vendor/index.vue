<!-- 供应商与联系人通讯录 -->
<template>
  <div class="vendor-page">
    <div class="vendor-toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <ElInput
          v-model="keyword"
          placeholder="搜索姓名 / 公司 / 电话"
          clearable
          style="width: 240px"
        />
        <ElSelect v-model="role" placeholder="角色" clearable style="width: 130px">
          <ElOption v-for="item in VENDOR_ROLE_OPTIONS" :key="item" :label="item" :value="item" />
        </ElSelect>
        <span class="text-xs text-g-500">共 {{ filtered.length }} 位</span>
      </div>
      <ElButton type="primary" @click="openCreate">
        <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
        新增联系人
      </ElButton>
    </div>

    <div class="vendor-grid">
      <div v-for="vendor in filtered" :key="vendor.id" class="vendor-card">
        <div class="vendor-card__head">
          <div class="vendor-card__avatar">{{ vendor.name.slice(0, 1) }}</div>
          <div class="vendor-card__main">
            <span class="vendor-card__name">{{ vendor.name }}</span>
            <span class="vendor-card__company">{{ vendor.company || '未填写公司' }}</span>
          </div>
          <ElTag size="small" effect="plain">{{ vendor.role || '其他' }}</ElTag>
        </div>

        <div class="vendor-card__rows">
          <div class="vendor-card__row">
            <ArtSvgIcon icon="ri:phone-line" class="text-g-500" />
            <span>{{ vendor.phone || '未填写电话' }}</span>
            <ElButton
              v-if="vendor.phone"
              link
              type="primary"
              size="small"
              @click="copy(vendor.phone)"
            >
              复制
            </ElButton>
          </div>
          <div class="vendor-card__row">
            <ArtSvgIcon icon="ri:wechat-line" class="text-g-500" />
            <span>{{ vendor.wechat || '未填写微信' }}</span>
          </div>
        </div>

        <p class="vendor-card__note">{{ vendor.note || '暂无备注' }}</p>

        <div class="vendor-card__footer">
          <ElButton link type="primary" @click="openEdit(vendor)">编辑</ElButton>
          <ElButton link type="danger" @click="handleDelete(vendor)">删除</ElButton>
        </div>
      </div>

      <div class="vendor-card vendor-card--add" @click="openCreate">
        <ArtSvgIcon icon="ri:user-add-line" class="text-2xl text-g-400" />
        <span>添加联系人</span>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="form.id ? '编辑联系人' : '新增联系人'"
      width="560px"
      class="vendor-dialog"
      append-to-body
    >
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="姓名" required>
          <ElInput v-model="form.name" placeholder="如：王工" maxlength="20" />
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="form.role" style="width: 100%" filterable allow-create>
            <ElOption v-for="item in VENDOR_ROLE_OPTIONS" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="公司 / 店铺">
          <ElInput v-model="form.company" maxlength="40" />
        </ElFormItem>
        <ElFormItem label="电话">
          <ElInput v-model="form.phone" maxlength="20" />
        </ElFormItem>
        <ElFormItem label="微信">
          <ElInput v-model="form.wechat" maxlength="30" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="form.note" type="textarea" :rows="2" maxlength="120" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="save">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { VENDOR_ROLE_OPTIONS } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { Vendor } from '@/types/renovation'

  defineOptions({ name: 'ProcessVendor' })

  const store = useRenovationStore()
  const keyword = ref('')
  const role = ref('')
  const dialogVisible = ref(false)

  const form = reactive<Vendor>({
    id: '',
    name: '',
    role: '工长',
    company: '',
    phone: '',
    wechat: '',
    note: ''
  })

  const filtered = computed(() =>
    store.vendors.filter((vendor) => {
      if (role.value && vendor.role !== role.value) return false
      if (keyword.value) {
        const text = [vendor.name, vendor.company, vendor.phone, vendor.wechat]
          .filter(Boolean)
          .join(' ')
        if (!text.includes(keyword.value.trim())) return false
      }
      return true
    })
  )

  function openCreate(): void {
    Object.assign(form, {
      id: '',
      name: '',
      role: '工长',
      company: '',
      phone: '',
      wechat: '',
      note: ''
    })
    dialogVisible.value = true
  }

  function openEdit(vendor: Vendor): void {
    Object.assign(form, vendor)
    dialogVisible.value = true
  }

  function save(): void {
    if (!form.name.trim()) {
      ElMessage.warning('请填写姓名')
      return
    }
    store.upsertVendor({ ...form })
    ElMessage.success('已保存')
    dialogVisible.value = false
  }

  async function handleDelete(vendor: Vendor): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除联系人「${vendor.name}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeVendor(vendor.id)
    ElMessage.success('已删除')
  }

  async function copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制')
    } catch {
      ElMessage.warning('复制失败，请手动选择')
    }
  }
</script>

<style scoped lang="scss">
  .vendor-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .vendor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
  }

  .vendor-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .vendor-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);

    &__head {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    &__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      font-size: 15px;
      color: #fff;
      background: var(--art-primary);
      border-radius: 50%;
    }

    &__main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
    }

    &__name {
      font-size: 14px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__company {
      overflow: hidden;
      font-size: 11px;
      color: var(--art-gray-500);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__rows {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 0;
      border-top: 1px dashed var(--default-border-dashed);
      border-bottom: 1px dashed var(--default-border-dashed);
    }

    &__row {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 12px;
      color: var(--art-gray-700);
    }

    &__note {
      min-height: 32px;
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--art-gray-500);
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
      margin-top: auto;
    }

    &--add {
      align-items: center;
      justify-content: center;
      min-height: 200px;
      font-size: 13px;
      color: var(--art-gray-500);
      cursor: pointer;
      border-style: dashed;

      &:hover {
        color: var(--art-primary);
        border-color: var(--art-primary);
      }
    }
  }

  @media (width <= 1280px) {
    .vendor-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width <= 900px) {
    .vendor-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

<!-- 弹窗 append-to-body，scoped 样式命中不了，用唯一类名约束全局 -->
<style lang="scss">
  /* 长标签（如「公司 / 店铺」）不再折行，避免和下一行标签挤在一起 */
  .vendor-dialog.el-dialog {
    .el-form-item__label {
      white-space: nowrap;
    }
  }
</style>
