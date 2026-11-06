<!-- 装修公司报价对比 -->
<template>
  <div class="compare-page art-full-height">
    <div class="compare-head">
      <div>
        <h2 class="compare-head__title">报价对比</h2>
        <p class="compare-head__sub">
          辅材口径来自《三套辅材标准对比分析》，共 {{ auxStandardRows.length }} 类；
          报价可在「公司档案」中补全
        </p>
      </div>
      <ElButton @click="router.push('/company/list')">
        <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
        维护公司档案
      </ElButton>
    </div>

    <div class="compare-stats">
      <div v-for="company in companies" :key="company.id" class="compare-stat">
        <div class="compare-stat__head">
          <span class="compare-stat__name">{{ company.name }}</span>
          <ElTag size="small" effect="plain">{{ company.type || '-' }}</ElTag>
        </div>
        <div class="compare-stat__row">
          <span>辅材覆盖</span>
          <b>{{ coverageOf(company.id).listed }} / {{ auxStandardRows.length }}</b>
        </div>
        <div class="compare-stat__row">
          <span>完整覆盖</span>
          <b>{{ coverageOf(company.id).full }} 类</b>
        </div>
        <div class="compare-stat__row">
          <span>报价总额</span>
          <b>{{ company.quoteTotal > 0 ? `¥ ${formatMoney(company.quoteTotal)}` : '未录入' }}</b>
        </div>
      </div>
    </div>

    <div class="compare-toolbar">
      <ElRadioGroup v-model="tab">
        <ElRadioButton value="aux">辅材标准对比</ElRadioButton>
        <ElRadioButton value="main">主材清单</ElRadioButton>
        <ElRadioButton value="quote">报价对比</ElRadioButton>
      </ElRadioGroup>
      <div v-if="tab === 'aux'" class="flex items-center gap-3">
        <ElSwitch v-model="onlyDiff" size="small" />
        <span class="text-xs text-g-600">只看差异（覆盖度或品牌不同）</span>
        <span class="text-xs text-g-500">共 {{ filteredRows.length }} 类</span>
      </div>
      <div v-else-if="tab === 'main'" class="flex flex-wrap items-center gap-2">
        <ElSelect v-model="mainCompanyId" placeholder="全部公司" clearable style="width: 180px">
          <ElOption
            v-for="company in companies"
            :key="company.id"
            :label="company.name"
            :value="company.id"
          />
        </ElSelect>
        <span class="text-xs text-g-500">共 {{ mainItems.length }} 条</span>
        <ElButton type="primary" size="small" @click="openMainCreate">新增主材</ElButton>
      </div>
    </div>

    <div v-if="tab === 'aux'" class="art-card compare-matrix">
      <ElTable :data="filteredRows" height="100%" border row-key="key">
        <ElTableColumn label="对比项" width="150" fixed>
          <template #default="{ row }">
            <div class="matrix-name">
              <span>{{ row.name }}</span>
              <span class="matrix-name__cat">{{ categoryGroup(row.key) }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn
          v-for="company in companies"
          :key="company.id"
          :label="company.name"
          min-width="250"
        >
          <template #default="{ row }">
            <div v-if="cellOf(company.id, row.key)" class="matrix-cell">
              <div class="matrix-cell__brand" :title="cellOf(company.id, row.key)?.brand || ''">
                {{ cellOf(company.id, row.key)?.brand || '未填写品牌' }}
              </div>
              <ElTooltip
                :content="cellOf(company.id, row.key)?.spec || '无详细规格'"
                placement="top"
                :show-after="200"
                popper-class="matrix-tooltip"
              >
                <ElTag
                  size="small"
                  :type="coverageMeta(cellOf(company.id, row.key)?.coverage).type"
                  effect="light"
                >
                  {{ coverageMeta(cellOf(company.id, row.key)?.coverage).label }}
                </ElTag>
              </ElTooltip>
            </div>
            <span v-else class="text-xs text-g-400">—</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="差异要点" min-width="220">
          <template #default="{ row }">
            <ElTooltip
              :content="row.diff || '暂无差异说明'"
              placement="top"
              :show-after="200"
              popper-class="matrix-tooltip"
            >
              <span class="matrix-diff">{{ row.diff }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div v-else-if="tab === 'main'" class="art-card compare-matrix">
      <ElTable :data="mainItems" height="100%" border>
        <ElTableColumn label="公司" width="150" fixed>
          <template #default="{ row }">{{ companyName(row.companyId) }}</template>
        </ElTableColumn>
        <ElTableColumn label="分类" width="160">
          <template #default="{ row }">
            <div class="matrix-name">
              <span>{{ getCategoryLabel(row.categoryKey) }}</span>
              <span class="matrix-name__cat">{{ categoryGroup(row.categoryKey) }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="名称" min-width="160" />
        <ElTableColumn label="品牌 / 型号" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{
            [row.brand, row.model].filter(Boolean).join(' ') || '-'
          }}</template>
        </ElTableColumn>
        <ElTableColumn prop="spec" label="规格" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="单价" width="120" align="right">
          <template #default="{ row }">
            {{ row.price > 0 ? `¥ ${formatMoney(row.price)}` : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="note" label="备注" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <div class="flex-c">
              <ElButton link type="primary" @click="openMainEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleMainDelete(row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
        <template #empty>
          <ElEmpty description="还没有录入主材报价，点右上角「新增主材」" :image-size="80" />
        </template>
      </ElTable>
    </div>

    <div v-else class="compare-quote">
      <div class="art-card compare-chart">
        <div class="compare-chart__title">报价总额对比</div>
        <ArtBarChart
          v-if="hasQuote"
          :data="quoteChart.data"
          :x-axis-data="quoteChart.xAxisData"
          height="240px"
          :show-legend="false"
        />
        <ElEmpty v-else description="还没有录入任何报价总额" :image-size="80" />
      </div>

      <div class="art-card compare-table">
        <ElTable :data="companies" height="100%" border>
          <ElTableColumn prop="name" label="公司" min-width="160" fixed />
          <ElTableColumn prop="type" label="模式" width="90" />
          <ElTableColumn label="报价总额" width="140" align="right">
            <template #default="{ row }">
              <div class="quote-total">
                <span>{{
                  row.quoteTotal > 0 ? `¥ ${formatMoney(row.quoteTotal)}` : '未录入'
                }}</span>
                <ElTag
                  v-if="row.quoteTotal > 0 && row.quoteTotal === minQuote"
                  size="small"
                  type="success"
                >
                  最低
                </ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="主材" width="120" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.mainTotal) }}</template>
          </ElTableColumn>
          <ElTableColumn label="辅材" width="120" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.auxTotal) }}</template>
          </ElTableColumn>
          <ElTableColumn label="人工" width="120" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.laborTotal) }}</template>
          </ElTableColumn>
          <ElTableColumn label="管理费" width="120" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.managementTotal) }}</template>
          </ElTableColumn>
          <ElTableColumn label="工期" width="90" align="right">
            <template #default="{ row }">{{
              row.durationDays ? `${row.durationDays} 天` : '-'
            }}</template>
          </ElTableColumn>
          <ElTableColumn prop="warranty" label="质保" min-width="150" show-overflow-tooltip />
        </ElTable>
      </div>
    </div>

    <CompanyMainDialog
      v-model="mainDialogVisible"
      :item="editingMain"
      :default-company-id="mainCompanyId"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import CompanyMainDialog from './modules/company-main-dialog.vue'
  import { auxStandardRows } from '@/config/seed'
  import { getCategoryLabel, getCategoryPath } from '@/config/taxonomy'
  import { COVERAGE_OPTIONS, formatMoney, getDictMeta } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { CompanyItem, CoverageType } from '@/types/renovation'

  defineOptions({ name: 'CompanyCompare' })

  const router = useRouter()
  const store = useRenovationStore()

  const tab = ref<'aux' | 'main' | 'quote'>('aux')
  const onlyDiff = ref(false)
  const mainCompanyId = ref('')
  const mainDialogVisible = ref(false)
  const editingMain = ref<CompanyItem | null>(null)

  const companies = computed(() => store.companies)

  const mainItems = computed(() =>
    store.companyItems
      .filter((item) => item.kind === 'main')
      .filter((item) => !mainCompanyId.value || item.companyId === mainCompanyId.value)
  )

  function companyName(companyId: string): string {
    return store.companies.find((company) => company.id === companyId)?.name || '-'
  }

  function openMainCreate(): void {
    editingMain.value = null
    mainDialogVisible.value = true
  }

  function openMainEdit(item: CompanyItem): void {
    editingMain.value = item
    mainDialogVisible.value = true
  }

  async function handleMainDelete(item: CompanyItem): Promise<void> {
    try {
      await ElMessageBox.confirm(`确定删除「${item.name}」这条主材报价吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    store.removeCompanyItem(item.id)
    ElMessage.success('已删除')
  }

  const filteredRows = computed(() => {
    if (!onlyDiff.value) return auxStandardRows
    return auxStandardRows.filter((row) => {
      const coverageSet = new Set(
        companies.value.map((company) => cellOf(company.id, row.key)?.coverage || 'none')
      )
      const brandSet = new Set(
        companies.value.map((company) => cellOf(company.id, row.key)?.brand || '')
      )
      return coverageSet.size > 1 || brandSet.size > 1
    })
  })

  function cellOf(companyId: string, key: string): CompanyItem | undefined {
    return store.companyItems.find(
      (item) => item.companyId === companyId && item.categoryKey === key
    )
  }

  function coverageOf(companyId: string) {
    const list = store.companyItems.filter((item) => item.companyId === companyId)
    return {
      listed: list.filter((item) => item.coverage !== 'none').length,
      full: list.filter((item) => item.coverage === 'full').length
    }
  }

  function coverageMeta(coverage?: CoverageType) {
    return (
      getDictMeta(COVERAGE_OPTIONS, coverage || 'none') || {
        label: '未列',
        type: 'danger' as const
      }
    )
  }

  function categoryGroup(key: string): string {
    const path = getCategoryPath(key)
    return path
      .slice(1, -1)
      .map((node) => node.label)
      .join(' / ')
  }

  const hasQuote = computed(() => companies.value.some((company) => company.quoteTotal > 0))

  const minQuote = computed(() => {
    const list = companies.value.map((company) => company.quoteTotal).filter((value) => value > 0)
    return list.length ? Math.min(...list) : 0
  })

  const quoteChart = computed(() => ({
    xAxisData: companies.value.map((company) => company.name),
    data: companies.value.map((company) => Number(company.quoteTotal.toFixed(2)))
  }))
</script>

<style lang="scss">
  .matrix-tooltip {
    max-width: 420px;
    line-height: 1.6;
  }
</style>

<style scoped lang="scss">
  .compare-page {
    gap: 12px;
  }

  .compare-head {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    &__title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__sub {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--art-gray-500);
    }
  }

  .compare-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .compare-stat {
    padding: 14px 16px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);

    &__head {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px dashed var(--default-border-dashed);
    }

    &__name {
      font-size: 14px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 12px;
      color: var(--art-gray-500);

      b {
        font-weight: 500;
        color: var(--art-gray-800);
      }
    }
  }

  .compare-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--default-box-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
  }

  .compare-matrix {
    flex: 1;
    min-height: 0;
    padding: 10px 12px;

    :deep(.el-table) {
      height: 100%;
    }
  }

  .matrix-name {
    display: flex;
    flex-direction: column;
    line-height: 1.35;

    &__cat {
      font-size: 11px;
      color: var(--art-gray-500);
    }
  }

  .matrix-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    &__brand {
      flex: 1;
      overflow: hidden;
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-gray-700);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .matrix-diff {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    font-size: 12px;
    line-height: 1.5;
    color: var(--art-gray-500);
    -webkit-box-orient: vertical;
  }

  .compare-quote {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .compare-chart {
    padding: 14px 16px;

    &__title {
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--art-gray-900);
    }
  }

  .compare-table {
    flex: 1;
    min-height: 280px;
    padding: 10px 12px;

    :deep(.el-table) {
      height: 100%;
    }
  }

  .quote-total {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }

  @media (width <= 900px) {
    .compare-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
