<!-- 装修公司档案 -->
<template>
  <div class="company-list">
    <div class="company-list__head">
      <div>
        <h2 class="company-list__title">装修公司对比</h2>
        <p class="company-list__sub">
          已录入 {{ store.companies.length }} 家公司，辅材对比基于
          {{ auxStandardRows.length }} 类统一口径
        </p>
      </div>
      <div class="flex gap-2">
        <ElButton @click="router.push('/company/compare')">
          <ArtSvgIcon icon="ri:bar-chart-box-line" class="mr-1" />
          查看对比
        </ElButton>
        <ElButton type="primary" @click="openCreate">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          新增公司
        </ElButton>
      </div>
    </div>

    <div class="company-grid">
      <div v-for="company in store.companies" :key="company.id" class="company-card">
        <div class="company-card__head">
          <div>
            <div class="company-card__name">{{ company.name }}</div>
            <div class="company-card__tags">
              <ElTag size="small" effect="plain">{{ company.type || '未设置模式' }}</ElTag>
              <ElTag size="small" type="info" effect="plain">
                辅材 {{ coverage(company.id).listed }}/{{ auxStandardRows.length }}
              </ElTag>
            </div>
          </div>
          <ElRate :model-value="company.rating" :max="5" disabled size="small" />
        </div>

        <div class="company-card__quote">
          <span class="company-card__quote-label">报价总额</span>
          <span class="company-card__quote-value">
            {{ company.quoteTotal > 0 ? `¥ ${formatMoney(company.quoteTotal)}` : '未录入' }}
          </span>
        </div>

        <div class="company-card__meta">
          <div class="company-card__meta-item">
            <span>工期</span>
            <b>{{ company.durationDays ? `${company.durationDays} 天` : '-' }}</b>
          </div>
          <div class="company-card__meta-item">
            <span>质保</span>
            <b>{{ company.warranty || '-' }}</b>
          </div>
          <div class="company-card__meta-item">
            <span>联系人</span>
            <b>{{ company.contact || '-' }}</b>
          </div>
        </div>

        <div class="company-card__lists">
          <div class="company-card__list">
            <div class="company-card__list-title is-pro">优势</div>
            <ul>
              <li v-for="(item, index) in company.pros.slice(0, 3)" :key="index">{{ item }}</li>
              <li v-if="!company.pros.length" class="is-empty">暂无</li>
            </ul>
          </div>
          <div class="company-card__list">
            <div class="company-card__list-title is-con">风险</div>
            <ul>
              <li v-for="(item, index) in company.cons.slice(0, 3)" :key="index">{{ item }}</li>
              <li v-if="!company.cons.length" class="is-empty">暂无</li>
            </ul>
          </div>
        </div>

        <div class="company-card__footer">
          <span class="company-card__note">{{ company.note || '' }}</span>
          <div class="flex gap-1">
            <ElButton link type="primary" @click="openEdit(company)">编辑</ElButton>
            <ElButton link type="danger" @click="handleDelete(company)">删除</ElButton>
          </div>
        </div>
      </div>

      <div class="company-card company-card--add" @click="openCreate">
        <ArtSvgIcon icon="ri:add-circle-line" class="text-3xl text-g-400" />
        <span>新增一家装修公司</span>
      </div>
    </div>

    <CompanyDialog v-model="dialogVisible" :company="editing" @saved="dialogVisible = false" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import CompanyDialog from './modules/company-dialog.vue'
  import { auxStandardRows } from '@/config/seed'
  import { formatMoney } from '@/config/renovation-dict'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { Company } from '@/types/renovation'

  defineOptions({ name: 'CompanyList' })

  const router = useRouter()
  const store = useRenovationStore()

  const dialogVisible = ref(false)
  const editing = ref<Company | null>(null)

  function coverage(companyId: string) {
    const list = store.companyItems.filter((item) => item.companyId === companyId)
    return {
      listed: list.filter((item) => item.coverage !== 'none').length,
      full: list.filter((item) => item.coverage === 'full').length
    }
  }

  function openCreate(): void {
    editing.value = null
    dialogVisible.value = true
  }

  function openEdit(company: Company): void {
    editing.value = company
    dialogVisible.value = true
  }

  async function handleDelete(company: Company): Promise<void> {
    try {
      await ElMessageBox.confirm(
        `确定删除「${company.name}」吗？该公司的报价明细会一并删除。`,
        '删除确认',
        { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    store.removeCompany(company.id)
    ElMessage.success('已删除')
  }
</script>

<style scoped lang="scss">
  .company-list {
    &__head {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

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

  .company-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .company-card {
    display: flex;
    flex-direction: column;
    padding: 18px;
    background: var(--default-box-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 4px);
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
    }

    &__head {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      justify-content: space-between;
    }

    &__name {
      font-size: 16px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__tags {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }

    &__quote {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 14px 0 12px;
      margin-top: 8px;
      border-bottom: 1px dashed var(--default-border-dashed);
    }

    &__quote-label {
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__quote-value {
      font-size: 20px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      padding: 12px 0;
      border-bottom: 1px dashed var(--default-border-dashed);
    }

    &__meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 11px;
      color: var(--art-gray-500);

      b {
        font-size: 12px;
        font-weight: 500;
        color: var(--art-gray-800);
      }
    }

    &__lists {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px 0;
    }

    &__list-title {
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 500;

      &.is-pro {
        color: var(--el-color-success);
      }

      &.is-con {
        color: var(--el-color-danger);
      }
    }

    &__list ul {
      padding: 0;
      margin: 0;
      list-style: none;

      li {
        position: relative;
        padding-left: 10px;
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--art-gray-600);

        &::before {
          position: absolute;
          top: 7px;
          left: 0;
          width: 4px;
          height: 4px;
          content: '';
          background: var(--art-gray-400);
          border-radius: 50%;
        }

        &.is-empty {
          color: var(--art-gray-400);
        }
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      margin-top: auto;
      border-top: 1px solid var(--default-border);
    }

    &__note {
      overflow: hidden;
      font-size: 11px;
      color: var(--art-gray-400);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--add {
      gap: 10px;
      align-items: center;
      justify-content: center;
      min-height: 280px;
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

  @media (width <= 1200px) {
    .company-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 760px) {
    .company-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
