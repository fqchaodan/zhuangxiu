<!-- 数据管理：房间、备份、导入导出 -->
<template>
  <div class="data-page">
    <div class="data-stats">
      <div class="stat-tile">
        <span class="stat-tile__label">条目</span>
        <span class="stat-tile__value">{{ store.items.length }}</span>
        <span class="stat-tile__sub"
          >硬装 {{ store.hardItems.length }} / 软装 {{ store.softItems.length }}</span
        >
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">房间</span>
        <span class="stat-tile__value">{{ store.rooms.length }}</span>
        <span class="stat-tile__sub">用于空间统计</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">公司 / 报价</span>
        <span class="stat-tile__value">{{ store.companies.length }}</span>
        <span class="stat-tile__sub">{{ store.companyItems.length }} 条报价明细</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">存储占用</span>
        <span class="stat-tile__value">{{ storageText }}</span>
        <span class="stat-tile__sub">浏览器本地存储</span>
      </div>
    </div>

    <div class="art-card data-card">
      <div class="data-card__head">
        <div>
          <span class="data-card__title">房间管理</span>
          <span class="ml-2 text-xs text-g-500">条目的空间归类和「各空间花费」都依赖这里</span>
        </div>
        <ElButton type="primary" size="small" @click="openRoomCreate">新增房间</ElButton>
      </div>

      <ElTable :data="store.rooms" max-height="300" border>
        <ElTableColumn prop="name" label="房间" min-width="140" />
        <ElTableColumn label="面积（㎡）" width="140" align="right">
          <template #default="{ row }">{{ row.area || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="note" label="备注" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="flex-c">
              <ElButton link type="primary" @click="openRoomEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleRoomDelete(row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="data-grid">
      <div class="art-card data-card">
        <div class="data-card__head">
          <span class="data-card__title">备份与恢复</span>
        </div>
        <p class="data-card__desc">
          导出为 JSON 文件，包含条目、房间、公司报价、预算、进度、验收、问题、供应商。
          建议每次大批量录入后导出一份。
        </p>
        <div class="flex flex-wrap gap-2">
          <ElButton type="primary" @click="handleExport">
            <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
            导出 JSON
          </ElButton>
          <ElButton @click="triggerImport">
            <ArtSvgIcon icon="ri:upload-2-line" class="mr-1" />
            导入 JSON
          </ElButton>
          <input
            ref="fileInput"
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="handleImport"
          />
        </div>
        <div class="data-card__note">
          <ElAlert
            type="warning"
            :closable="false"
            show-icon
            title="导入会覆盖当前全部数据，请先导出一份备份。"
          />
        </div>
      </div>

      <div class="art-card data-card">
        <div class="data-card__head">
          <span class="data-card__title">数据重置</span>
        </div>
        <p class="data-card__desc">
          重置示例数据会恢复房间、三家辅材标准与付款节点，并清空已录入的条目。
        </p>
        <div class="flex flex-wrap gap-2">
          <ElButton @click="handleResetSeed">重置示例数据</ElButton>
          <ElButton type="danger" plain @click="handleClearAll">清空全部数据</ElButton>
        </div>
        <div class="data-card__note">
          <ElAlert
            type="info"
            :closable="false"
            show-icon
            title="本应用为纯前端单机版，数据只保存在当前浏览器，不会上传服务器。"
          />
        </div>
      </div>
    </div>

    <ElDialog
      v-model="roomDialogVisible"
      :title="roomForm.id ? '编辑房间' : '新增房间'"
      width="420px"
      append-to-body
    >
      <ElForm :model="roomForm" label-width="96px">
        <ElFormItem label="房间名称" required>
          <ElInput v-model="roomForm.name" placeholder="如：主卧" maxlength="20" />
        </ElFormItem>
        <ElFormItem label="面积（㎡）">
          <ElInputNumber v-model="roomForm.area" :min="0" :precision="1" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="roomForm.note" maxlength="60" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="roomDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveRoom">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRenovationStore } from '@/store/modules/renovation'
  import { today } from '@/config/renovation-dict'
  import type { Room } from '@/types/renovation'

  defineOptions({ name: 'SystemData' })

  const store = useRenovationStore()
  const fileInput = ref<HTMLInputElement>()
  const roomDialogVisible = ref(false)

  const roomForm = reactive<Room>({ id: '', name: '', area: 0, note: '' })

  const storageText = computed(() => {
    const size = JSON.stringify(store.exportData()).length
    return size > 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(2)} MB`
      : `${(size / 1024).toFixed(1)} KB`
  })

  function openRoomCreate(): void {
    Object.assign(roomForm, { id: '', name: '', area: 0, note: '' })
    roomDialogVisible.value = true
  }

  function openRoomEdit(room: Room): void {
    Object.assign(roomForm, room)
    roomDialogVisible.value = true
  }

  function saveRoom(): void {
    if (!roomForm.name.trim()) {
      ElMessage.warning('请填写房间名称')
      return
    }
    store.upsertRoom({ ...roomForm })
    ElMessage.success('已保存')
    roomDialogVisible.value = false
  }

  async function handleRoomDelete(room: Room): Promise<void> {
    try {
      await ElMessageBox.confirm(
        `确定删除房间「${room.name}」吗？已有条目的房间会变为未指定。`,
        '删除确认',
        { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    store.removeRoom(room.id)
    ElMessage.success('已删除')
  }

  function handleExport(): void {
    const data = store.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `筑家台账-备份-${today()}.json`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已导出备份文件')
  }

  function triggerImport(): void {
    fileInput.value?.click()
  }

  function handleImport(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
          throw new Error('文件格式不正确')
        }
        await ElMessageBox.confirm(
          `将导入 ${data.items.length} 条条目，并覆盖当前全部数据，确定继续吗？`,
          '导入确认',
          { type: 'warning', confirmButtonText: '覆盖导入', cancelButtonText: '取消' }
        )
        store.importData(data)
        ElMessage.success('导入完成')
      } catch (error) {
        if (error instanceof Error && error.message === '文件格式不正确') {
          ElMessage.error('文件格式不正确，请选择本应用导出的 JSON 备份')
        }
      } finally {
        input.value = ''
      }
    }
    reader.readAsText(file)
  }

  async function handleResetSeed(): Promise<void> {
    try {
      await ElMessageBox.confirm(
        '重置会清空已录入的条目，并恢复房间、公司报价、阶段与付款节点，确定继续吗？',
        '重置确认',
        { type: 'warning', confirmButtonText: '重置', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    store.resetToSeed()
    ElMessage.success('已重置为示例数据')
  }

  async function handleClearAll(): Promise<void> {
    try {
      await ElMessageBox.confirm(
        '将删除全部数据（条目、公司、预算、进度、问题、供应商），且不可恢复，确定继续吗？',
        '清空确认',
        { type: 'error', confirmButtonText: '全部清空', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    store.clearAll()
    ElMessage.success('已清空全部数据')
  }
</script>

<style scoped lang="scss">
  .data-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .data-stats {
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
    }

    &__sub {
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .data-card {
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

    &__desc {
      margin: 0 0 14px;
      font-size: 12px;
      line-height: 1.7;
      color: var(--art-gray-500);
    }

    &__note {
      padding-top: 16px;
      margin-top: 20px;
      border-top: 1px dashed var(--default-border-dashed);
    }
  }

  @media (width <= 1000px) {
    .data-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .data-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
