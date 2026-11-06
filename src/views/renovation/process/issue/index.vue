<!-- 问题整改清单 -->
<template>
  <div class="issue-page">
    <div class="issue-stats">
      <div class="stat-tile">
        <span class="stat-tile__label">待处理</span>
        <span class="stat-tile__value is-danger">{{ counts.open }}</span>
        <span class="stat-tile__sub">P0 紧急 {{ counts.p0 }} 项</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">整改中</span>
        <span class="stat-tile__value is-warning">{{ counts.fixing }}</span>
        <span class="stat-tile__sub">责任方跟进中</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">已完成</span>
        <span class="stat-tile__value is-success">{{ counts.done }}</span>
        <span class="stat-tile__sub">共 {{ store.issues.length }} 条记录</span>
      </div>
    </div>

    <div class="issue-toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <ElInput v-model="keyword" placeholder="搜索问题 / 位置" clearable style="width: 220px" />
        <ElSelect v-model="status" placeholder="状态" clearable style="width: 130px">
          <ElOption label="待处理" value="open" />
          <ElOption label="整改中" value="fixing" />
          <ElOption label="已完成" value="done" />
        </ElSelect>
        <ElSelect v-model="priority" placeholder="优先级" clearable style="width: 120px">
          <ElOption label="P0 紧急" value="P0" />
          <ElOption label="P1 重要" value="P1" />
          <ElOption label="P2 一般" value="P2" />
        </ElSelect>
        <span class="text-xs text-g-500">共 {{ filtered.length }} 条</span>
      </div>
      <ElButton type="primary" @click="openCreate">
        <ArtSvgIcon icon="ri:add-line" class="mr-1" />
        记录问题
      </ElButton>
    </div>

    <div class="art-card issue-card">
      <ElTable :data="filtered" height="480" border>
        <ElTableColumn label="问题" min-width="220">
          <template #default="{ row }">
            <div class="issue-title">
              <span>{{ row.title }}</span>
              <span class="issue-title__desc">{{ row.description }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="location" label="位置" width="120" />
        <ElTableColumn label="责任方" width="140">
          <template #default="{ row }">{{ vendorName(row.vendorId) }}</template>
        </ElTableColumn>
        <ElTableColumn label="优先级" width="100">
          <template #default="{ row }">
            <ElTag size="small" :type="priorityTag(row.priority).type" effect="light">
              {{ priorityTag(row.priority).label }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="dueDate" label="限期" width="110" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag size="small" :type="statusTag(row.status).type" effect="plain">
              {{ statusTag(row.status).label }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex-c">
              <ElButton v-if="row.status !== 'done'" link type="success" @click="markDone(row)">
                完成
              </ElButton>
              <ElButton link type="primary" @click="openEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
        <template #empty>
          <ElEmpty description="还没有记录问题，建议验收时随手记" :image-size="80" />
        </template>
      </ElTable>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="form.id ? '编辑问题' : '记录问题'"
      width="560px"
      append-to-body
    >
      <ElForm :model="form" label-width="88px">
        <ElFormItem label="问题标题" required>
          <ElInput v-model="form.title" placeholder="如：卫生间门槛石渗水" maxlength="40" />
        </ElFormItem>
        <ElFormItem label="位置">
          <ElInput v-model="form.location" placeholder="如：主卫门口" maxlength="40" />
        </ElFormItem>
        <ElFormItem label="详细描述">
          <ElInput v-model="form.description" type="textarea" :rows="3" maxlength="200" />
        </ElFormItem>
        <ElFormItem label="责任方">
          <ElSelect v-model="form.vendorId" clearable class="w-full">
            <ElOption
              v-for="vendor in store.vendors"
              :key="vendor.id"
              :label="`${vendor.name}${vendor.company ? ' · ' + vendor.company : ''}`"
              :value="vendor.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="form.priority" class="w-full">
            <ElOption label="P0 紧急" value="P0" />
            <ElOption label="P1 重要" value="P1" />
            <ElOption label="P2 一般" value="P2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="限期">
          <ElDatePicker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="form.status" class="w-full">
            <ElOption label="待处理" value="open" />
            <ElOption label="整改中" value="fixing" />
            <ElOption label="已完成" value="done" />
          </ElSelect>
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
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { Issue } from '@/types/renovation'

  defineOptions({ name: 'ProcessIssue' })

  const store = useRenovationStore()
  const keyword = ref('')
  const status = ref<Issue['status'] | ''>('')
  const priority = ref<Issue['priority'] | ''>('')
  const dialogVisible = ref(false)

  const form = reactive<Issue>({
    id: '',
    title: '',
    location: '',
    description: '',
    vendorId: '',
    priority: 'P1',
    dueDate: '',
    status: 'open',
    createdAt: 0
  })

  const filtered = computed(() =>
    store.issues.filter((issue) => {
      if (status.value && issue.status !== status.value) return false
      if (priority.value && issue.priority !== priority.value) return false
      if (keyword.value) {
        const text = [issue.title, issue.location, issue.description].filter(Boolean).join(' ')
        if (!text.includes(keyword.value.trim())) return false
      }
      return true
    })
  )

  const counts = computed(() => ({
    open: store.issues.filter((issue) => issue.status === 'open').length,
    fixing: store.issues.filter((issue) => issue.status === 'fixing').length,
    done: store.issues.filter((issue) => issue.status === 'done').length,
    p0: store.issues.filter((issue) => issue.priority === 'P0' && issue.status !== 'done').length
  }))

  function vendorName(vendorId: string): string {
    return store.vendors.find((vendor) => vendor.id === vendorId)?.name || '-'
  }

  function priorityTag(value: Issue['priority']) {
    if (value === 'P0') return { label: 'P0 紧急', type: 'danger' as const }
    if (value === 'P1') return { label: 'P1 重要', type: 'warning' as const }
    return { label: 'P2 一般', type: 'info' as const }
  }

  function statusTag(value: Issue['status']) {
    if (value === 'done') return { label: '已完成', type: 'success' as const }
    if (value === 'fixing') return { label: '整改中', type: 'warning' as const }
    return { label: '待处理', type: 'danger' as const }
  }

  function openCreate(): void {
    Object.assign(form, {
      id: '',
      title: '',
      location: '',
      description: '',
      vendorId: '',
      priority: 'P1',
      dueDate: '',
      status: 'open',
      createdAt: 0
    })
    dialogVisible.value = true
  }

  function openEdit(issue: Issue): void {
    Object.assign(form, issue)
    dialogVisible.value = true
  }

  function save(): void {
    if (!form.title.trim()) {
      ElMessage.warning('请填写问题标题')
      return
    }
    store.upsertIssue({ ...form })
    ElMessage.success('已保存')
    dialogVisible.value = false
  }

  function markDone(issue: Issue): void {
    store.upsertIssue({ ...issue, status: 'done' })
    ElMessage.success('已标记为完成')
  }

  async function handleDelete(issue: Issue): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除问题「${issue.title}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeIssue(issue.id)
    ElMessage.success('已删除')
  }
</script>

<style scoped lang="scss">
  .issue-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .issue-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

      &.is-danger {
        color: var(--el-color-danger);
      }

      &.is-warning {
        color: var(--el-color-warning);
      }

      &.is-success {
        color: var(--el-color-success);
      }
    }

    &__sub {
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }

  .issue-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
  }

  .issue-card {
    min-height: 420px;
    padding: 10px 12px;
  }

  .issue-title {
    display: flex;
    flex-direction: column;
    line-height: 1.35;

    &__desc {
      overflow: hidden;
      font-size: 11px;
      color: var(--art-gray-500);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media (width <= 900px) {
    .issue-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
