<!-- 进度与验收 -->
<template>
  <div class="progress-page">
    <div class="art-card progress-overview">
      <div class="progress-overview__left">
        <span class="progress-overview__label">整体进度</span>
        <span class="progress-overview__value">{{ donePercent }}%</span>
        <span class="progress-overview__sub">
          {{ store.donePhaseCount }} / {{ store.phases.length }} 个阶段已完成 · 当前「{{
            currentPhase
          }}」
        </span>
      </div>
      <ElProgress
        :percentage="donePercent"
        :stroke-width="12"
        :show-text="false"
        class="progress-overview__bar"
      />
      <div class="progress-overview__actions">
        <ElButton type="primary" @click="openPhaseCreate">新增阶段</ElButton>
        <ElButton @click="openAcceptCreate">新增验收</ElButton>
      </div>
    </div>

    <div class="art-card progress-card">
      <div class="progress-card__head">
        <span class="progress-card__title">施工阶段</span>
        <span class="text-xs text-g-500">状态可直接切换，日期点击「编辑」维护</span>
      </div>
      <ElTable :data="store.phases" height="360" border>
        <ElTableColumn label="阶段" min-width="120">
          <template #default="{ row }">
            <span class="phase-name">{{ row.name }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="170">
          <template #default="{ row }">
            <ElSelect
              :model-value="row.status"
              size="small"
              style="width: 140px"
              @change="(value) => changePhaseStatus(row, value)"
            >
              <ElOption label="未开始" value="todo" />
              <ElOption label="进行中" value="doing" />
              <ElOption label="已完成" value="done" />
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="planStart" label="计划开始" width="110" />
        <ElTableColumn prop="planEnd" label="计划结束" width="110" />
        <ElTableColumn prop="actualStart" label="实际开始" width="110" />
        <ElTableColumn prop="actualEnd" label="实际结束" width="110" />
        <ElTableColumn prop="note" label="备注" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <div class="flex-c">
              <ElButton link type="primary" @click="openPhaseEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handlePhaseDelete(row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="art-card progress-card">
      <div class="progress-card__head">
        <span class="progress-card__title">验收记录</span>
        <span class="text-xs text-g-500">{{ store.acceptances.length }} 条</span>
      </div>
      <ElTable :data="store.acceptances" height="280" border>
        <ElTableColumn prop="name" label="验收项" min-width="160" />
        <ElTableColumn label="所属阶段" width="120">
          <template #default="{ row }">{{ phaseName(row.phaseId) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="date" label="验收日期" width="120" />
        <ElTableColumn label="结果" width="100">
          <template #default="{ row }">
            <ElTag size="small" :type="resultTag(row.result).type" effect="plain">
              {{ resultTag(row.result).label }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="inspector" label="验收人" width="120" />
        <ElTableColumn prop="note" label="备注" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <div class="flex-c">
              <ElButton link type="primary" @click="openAcceptEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleAcceptDelete(row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
        <template #empty>
          <ElEmpty
            description="还没有验收记录，水电、防水、泥木、竣工建议逐项记录"
            :image-size="70"
          />
        </template>
      </ElTable>
    </div>

    <ElDialog
      v-model="phaseDialogVisible"
      :title="phaseForm.id ? '编辑阶段' : '新增阶段'"
      width="520px"
      append-to-body
    >
      <ElForm :model="phaseForm" label-width="88px">
        <ElFormItem label="阶段名称" required>
          <ElInput v-model="phaseForm.name" placeholder="如：水电" maxlength="20" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="phaseForm.status" class="w-full">
            <ElOption label="未开始" value="todo" />
            <ElOption label="进行中" value="doing" />
            <ElOption label="已完成" value="done" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="计划开始">
          <ElDatePicker
            v-model="phaseForm.planStart"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="计划结束">
          <ElDatePicker
            v-model="phaseForm.planEnd"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="实际开始">
          <ElDatePicker
            v-model="phaseForm.actualStart"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="实际结束">
          <ElDatePicker
            v-model="phaseForm.actualEnd"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="phaseForm.note" type="textarea" :rows="2" maxlength="120" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="phaseDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="savePhase">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="acceptDialogVisible"
      :title="acceptForm.id ? '编辑验收' : '新增验收'"
      width="520px"
      append-to-body
    >
      <ElForm :model="acceptForm" label-width="88px">
        <ElFormItem label="验收项" required>
          <ElInput v-model="acceptForm.name" placeholder="如：水电隐蔽工程验收" maxlength="40" />
        </ElFormItem>
        <ElFormItem label="所属阶段">
          <ElSelect v-model="acceptForm.phaseId" class="w-full" clearable>
            <ElOption
              v-for="phase in store.phases"
              :key="phase.id"
              :label="phase.name"
              :value="phase.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="验收日期">
          <ElDatePicker
            v-model="acceptForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="结果">
          <ElSelect v-model="acceptForm.result" class="w-full">
            <ElOption label="待验收" value="pending" />
            <ElOption label="通过" value="pass" />
            <ElOption label="需整改" value="fail" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="验收人">
          <ElInput v-model="acceptForm.inspector" placeholder="姓名或监理" maxlength="20" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="acceptForm.note" type="textarea" :rows="2" maxlength="120" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="acceptDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveAccept">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { Acceptance, Phase } from '@/types/renovation'

  defineOptions({ name: 'ProcessProgress' })

  const store = useRenovationStore()

  const donePercent = computed(() =>
    store.phases.length ? Math.round((store.donePhaseCount / store.phases.length) * 100) : 0
  )

  const currentPhase = computed(() => {
    const doing = store.phases.find((phase) => phase.status === 'doing')
    if (doing) return doing.name
    const todo = store.phases.find((phase) => phase.status === 'todo')
    return todo ? todo.name : '已完工'
  })

  const phaseDialogVisible = ref(false)
  const phaseForm = reactive<Phase>({
    id: '',
    name: '',
    planStart: '',
    planEnd: '',
    actualStart: '',
    actualEnd: '',
    status: 'todo',
    note: ''
  })

  const acceptDialogVisible = ref(false)
  const acceptForm = reactive<Acceptance>({
    id: '',
    phaseId: '',
    name: '',
    date: '',
    result: 'pending',
    inspector: '',
    note: ''
  })

  function phaseName(phaseId: string): string {
    return store.phases.find((phase) => phase.id === phaseId)?.name || '-'
  }

  function resultTag(result: Acceptance['result']) {
    if (result === 'pass') return { label: '通过', type: 'success' as const }
    if (result === 'fail') return { label: '需整改', type: 'danger' as const }
    return { label: '待验收', type: 'info' as const }
  }

  function openPhaseCreate(): void {
    Object.assign(phaseForm, {
      id: '',
      name: '',
      planStart: '',
      planEnd: '',
      actualStart: '',
      actualEnd: '',
      status: 'todo',
      note: ''
    })
    phaseDialogVisible.value = true
  }

  function openPhaseEdit(phase: Phase): void {
    Object.assign(phaseForm, phase)
    phaseDialogVisible.value = true
  }

  function savePhase(): void {
    if (!phaseForm.name.trim()) {
      ElMessage.warning('请填写阶段名称')
      return
    }
    store.upsertPhase({ ...phaseForm })
    ElMessage.success('已保存')
    phaseDialogVisible.value = false
  }

  function changePhaseStatus(phase: Phase, status: string): void {
    store.upsertPhase({ ...phase, status: status as Phase['status'] })
  }

  async function handlePhaseDelete(phase: Phase): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除阶段「${phase.name}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removePhase(phase.id)
    ElMessage.success('已删除')
  }

  function openAcceptCreate(): void {
    Object.assign(acceptForm, {
      id: '',
      phaseId: '',
      name: '',
      date: '',
      result: 'pending',
      inspector: '',
      note: ''
    })
    acceptDialogVisible.value = true
  }

  function openAcceptEdit(acceptance: Acceptance): void {
    Object.assign(acceptForm, acceptance)
    acceptDialogVisible.value = true
  }

  function saveAccept(): void {
    if (!acceptForm.name.trim()) {
      ElMessage.warning('请填写验收项名称')
      return
    }
    store.upsertAcceptance({ ...acceptForm })
    ElMessage.success('已保存')
    acceptDialogVisible.value = false
  }

  async function handleAcceptDelete(acceptance: Acceptance): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除验收记录「${acceptance.name}」吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeAcceptance(acceptance.id)
    ElMessage.success('已删除')
  }
</script>

<style scoped lang="scss">
  .progress-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .progress-overview {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    padding: 18px 20px;

    &__left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 220px;
    }

    &__label {
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__value {
      font-size: 28px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__sub {
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__bar {
      flex: 1;
      min-width: 200px;
    }

    &__actions {
      display: flex;
      gap: 8px;
    }
  }

  .progress-card {
    padding: 16px 18px;

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__title {
      font-size: 15px;
      font-weight: 500;
      color: var(--art-gray-900);
    }
  }

  .phase-name {
    font-size: 13px;
    color: var(--art-gray-800);
  }
</style>
