<!-- 首页看板 -->
<template>
  <div class="dashboard">
    <div class="dashboard__hero">
      <div>
        <h2 class="dashboard__title">装修台账</h2>
        <p class="dashboard__sub">
          已录入 {{ store.items.length }} 条 · 覆盖 {{ coveredRooms }} 个空间 · 当前阶段「{{
            currentPhaseName
          }}」
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ElButton @click="router.push('/hard/main')">
          <ArtSvgIcon icon="ri:hammer-line" class="mr-1" />
          录入硬装
        </ElButton>
        <ElButton type="primary" @click="router.push('/soft/appliance')">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          录入软装
        </ElButton>
      </div>
    </div>

    <ElRow :gutter="12" class="mb-1">
      <ElCol :xs="12" :sm="12" :md="6">
        <ArtStatsCard
          title="合计金额"
          :count="Number(store.grandTotal.toFixed(2))"
          description="硬装 + 软装"
          icon="ri:money-cny-circle-line"
          icon-style="bg-primary"
          class="mb-3"
        />
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6">
        <ArtStatsCard
          title="已支付"
          :count="Number(store.paidTotal.toFixed(2))"
          description="已付金额合计"
          icon="ri:wallet-3-line"
          icon-style="bg-success"
          class="mb-3"
        />
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6">
        <ArtStatsCard
          title="待支付"
          :count="Number(store.unpaidTotal.toFixed(2))"
          description="金额 − 已付"
          icon="ri:time-line"
          icon-style="bg-warning"
          class="mb-3"
        />
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6">
        <ArtStatsCard
          title="已安装 / 验收"
          :count="store.installedCount"
          :description="`还剩待办 ${store.openIssueCount} 项`"
          icon="ri:checkbox-circle-line"
          icon-style="bg-info"
          class="mb-3"
        />
      </ElCol>
    </ElRow>

    <ElRow :gutter="12">
      <ElCol :xs="24" :lg="12">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">预算执行</span>
            <ElButton link type="primary" @click="router.push('/process/budget')">
              去设置
            </ElButton>
          </div>

          <template v-if="budgetTotal > 0">
            <div class="budget-line">
              <span class="budget-line__value">¥ {{ formatMoney(usedAmount) }}</span>
              <span class="budget-line__total">/ 预算 ¥ {{ formatMoney(budgetTotal) }}</span>
            </div>
            <ElProgress
              :percentage="Number(usedPercent.toFixed(1))"
              :stroke-width="10"
              :status="isOverBudget ? 'exception' : undefined"
              :color="isOverBudget ? undefined : '#5D87FF'"
            />
            <p class="budget-hint" :class="{ 'is-over': isOverBudget }">
              {{
                isOverBudget
                  ? `已超出预算 ¥ ${formatMoney(usedAmount - budgetTotal)}`
                  : `剩余 ¥ ${formatMoney(budgetTotal - usedAmount)}`
              }}
            </p>
          </template>
          <div v-else class="budget-empty">
            <p>还没有设置预算总额</p>
            <ElButton type="primary" plain size="small" @click="router.push('/process/budget')">
              设置预算
            </ElButton>
          </div>

          <div class="budget-split">
            <div class="budget-split__item">
              <span class="budget-split__label">硬装</span>
              <span class="budget-split__amount">¥ {{ formatMoney(store.hardTotal) }}</span>
              <span class="budget-split__sub">{{ store.hardItems.length }} 条</span>
            </div>
            <div class="budget-split__item">
              <span class="budget-split__label">软装</span>
              <span class="budget-split__amount">¥ {{ formatMoney(store.softTotal) }}</span>
              <span class="budget-split__sub">{{ store.softItems.length }} 条</span>
            </div>
            <div class="budget-split__item">
              <span class="budget-split__label">合同金额</span>
              <span class="budget-split__amount"
                >¥ {{ formatMoney(store.budget.contractAmount) }}</span
              >
              <span class="budget-split__sub">{{
                store.budget.contractAmount > 0 ? '已录入' : '未录入'
              }}</span>
            </div>
          </div>
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">硬装 / 软装结构</span>
            <ElButton link type="primary" @click="router.push('/summary')">查看汇总</ElButton>
          </div>
          <ArtRingChart
            v-if="store.grandTotal > 0"
            :data="structureData"
            :show-legend="true"
            legend-position="right"
            height="210px"
            :center-text="formatMoneyShort(store.grandTotal)"
          />
          <ElEmpty v-else description="录入条目后自动生成结构图" :image-size="80" />
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="12">
      <ElCol :xs="24" :lg="14">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">各空间花费</span>
            <span class="text-xs text-g-500">按房间汇总金额</span>
          </div>
          <ArtBarChart
            v-if="roomChart.xAxisData.length"
            :data="roomChart.data"
            :x-axis-data="roomChart.xAxisData"
            height="240px"
            :show-legend="false"
          />
          <ElEmpty v-else description="给条目选择房间后，这里会出现对比" :image-size="80" />
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="10">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">施工进度</span>
            <ElButton link type="primary" @click="router.push('/process/progress')">
              管理
            </ElButton>
          </div>
          <div class="phase-list">
            <div
              v-for="(phase, index) in store.phases"
              :key="phase.id"
              class="phase-item"
              :class="[`is-${phase.status}`]"
            >
              <div class="phase-item__dot">{{ index + 1 }}</div>
              <div class="phase-item__body">
                <span class="phase-item__name">{{ phase.name }}</span>
                <span class="phase-item__date">{{
                  phase.actualStart || phase.planStart || '未排期'
                }}</span>
              </div>
              <ElTag size="small" :type="phaseTag(phase.status).type" effect="plain">
                {{ phaseTag(phase.status).label }}
              </ElTag>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="12">
      <ElCol :xs="24" :lg="14">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">最近录入</span>
            <ElButton link type="primary" @click="router.push('/summary')">全部条目</ElButton>
          </div>
          <div v-if="recentItems.length" class="recent-list">
            <div v-for="item in recentItems" :key="item.id" class="recent-item">
              <div class="recent-item__main">
                <span class="recent-item__name">{{ item.name }}</span>
                <span class="recent-item__cat">{{ getCategoryFullLabel(item.categoryKey) }}</span>
              </div>
              <div class="recent-item__side">
                <span class="recent-item__amount">¥ {{ formatMoney(item.amount) }}</span>
                <span class="recent-item__time">{{ formatDateTime(item.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <ElEmpty v-else description="还没有录入任何条目" :image-size="70" />
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="10">
        <div class="art-card dashboard__card">
          <div class="dashboard__card-head">
            <span class="dashboard__card-title">待办提醒</span>
            <span class="text-xs text-g-500">{{ todos.length }} 项</span>
          </div>
          <div v-if="todos.length" class="todo-list">
            <div v-for="(todo, index) in todos" :key="index" class="todo-item">
              <span class="todo-item__dot" :class="`is-${todo.type}`"></span>
              <div class="todo-item__body">
                <span class="todo-item__title">{{ todo.title }}</span>
                <span class="todo-item__desc">{{ todo.desc }}</span>
              </div>
            </div>
          </div>
          <ElEmpty v-else description="暂无待办，保持这个节奏" :image-size="70" />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useRenovationStore } from '@/store/modules/renovation'
  import { getCategoryFullLabel } from '@/config/taxonomy'
  import { formatDateTime, formatMoney, formatMoneyShort } from '@/config/renovation-dict'

  defineOptions({ name: 'RenovationDashboard' })

  const router = useRouter()
  const store = useRenovationStore()

  const budgetTotal = computed(() => store.budget.total)
  const usedAmount = computed(() => store.grandTotal)
  const usedPercent = computed(() =>
    budgetTotal.value > 0 ? Math.min((usedAmount.value / budgetTotal.value) * 100, 100) : 0
  )
  const isOverBudget = computed(() => budgetTotal.value > 0 && usedAmount.value > budgetTotal.value)

  const coveredRooms = computed(
    () => new Set(store.items.map((item) => item.roomId).filter(Boolean)).size
  )

  const currentPhaseName = computed(() => {
    const doing = store.phases.find((phase) => phase.status === 'doing')
    if (doing) return doing.name
    const firstTodo = store.phases.find((phase) => phase.status === 'todo')
    if (firstTodo) return firstTodo.name
    return store.phases.length ? '已完工' : '未设置'
  })

  const structureData = computed(() => [
    { name: '硬装', value: Number(store.hardTotal.toFixed(2)) },
    { name: '软装', value: Number(store.softTotal.toFixed(2)) }
  ])

  const roomChart = computed(() => {
    const rows = store.rooms
      .map((room) => ({ name: room.name, value: store.sumByRoom(room.id) }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    return {
      xAxisData: rows.map((row) => row.name),
      data: rows.map((row) => Number(row.value.toFixed(2)))
    }
  })

  const recentItems = computed(() =>
    [...store.items].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6)
  )

  interface TodoItem {
    title: string
    desc: string
    type: 'warning' | 'danger' | 'info'
  }

  const todos = computed<TodoItem[]>(() => {
    const list: TodoItem[] = []
    store.payments
      .filter((payment) => payment.status !== 'paid')
      .slice(0, 3)
      .forEach((payment) => {
        list.push({
          title: `付款 · ${payment.name}`,
          desc: payment.dueDate ? `计划 ${payment.dueDate}` : '尚未设置日期',
          type: 'warning'
        })
      })
    store.issues
      .filter((issue) => issue.status !== 'done')
      .slice(0, 3)
      .forEach((issue) => {
        list.push({
          title: `整改 · ${issue.title}`,
          desc: issue.dueDate ? `限期 ${issue.dueDate}` : '待安排',
          type: 'danger'
        })
      })
    store.items
      .filter((item) => item.status === 'todo' || item.status === 'quoted')
      .slice(0, 3)
      .forEach((item) => {
        list.push({
          title: `待定 · ${item.name}`,
          desc: getCategoryFullLabel(item.categoryKey),
          type: 'info'
        })
      })
    return list.slice(0, 6)
  })

  function phaseTag(status: string) {
    if (status === 'done') return { label: '已完成', type: 'success' as const }
    if (status === 'doing') return { label: '进行中', type: 'primary' as const }
    return { label: '未开始', type: 'info' as const }
  }
</script>

<style scoped lang="scss">
  .dashboard {
    &__hero {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 4px 4px 14px;
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

    &__card {
      height: calc(100% - 12px);
      padding: 16px 18px;
      margin-bottom: 12px;
    }

    &__card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__card-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--art-gray-900);
    }
  }

  .budget-line {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 10px;

    &__value {
      font-size: 24px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__total {
      font-size: 13px;
      color: var(--art-gray-500);
    }
  }

  .budget-hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--art-gray-500);

    &.is-over {
      color: var(--el-color-danger);
    }
  }

  .budget-empty {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 8px;
    background: var(--art-gray-100);
    border-radius: 8px;

    p {
      margin: 0;
      font-size: 13px;
      color: var(--art-gray-600);
    }
  }

  .budget-split {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding-top: 14px;
    margin-top: 16px;
    border-top: 1px solid var(--default-border);

    &__item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__label {
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__amount {
      font-size: 16px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__sub {
      font-size: 11px;
      color: var(--art-gray-400);
    }
  }

  .phase-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 250px;
    overflow-y: auto;
  }

  .phase-item {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 6px 4px;

    &__dot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      font-size: 11px;
      color: var(--art-gray-500);
      background: var(--art-gray-200);
      border-radius: 50%;
    }

    &.is-done &__dot {
      color: #fff;
      background: var(--el-color-success);
    }

    &.is-doing &__dot {
      color: #fff;
      background: var(--art-primary);
    }

    &__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      line-height: 1.3;
    }

    &__name {
      font-size: 13px;
      color: var(--art-gray-800);
    }

    &__date {
      font-size: 11px;
      color: var(--art-gray-500);
    }
  }

  .recent-list {
    display: flex;
    flex-direction: column;
  }

  .recent-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0;
    border-bottom: 1px dashed var(--default-border-dashed);

    &:last-child {
      border-bottom: none;
    }

    &__main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    &__name {
      overflow: hidden;
      font-size: 13px;
      color: var(--art-gray-800);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__cat {
      font-size: 11px;
      color: var(--art-gray-500);
    }

    &__side {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-end;
    }

    &__amount {
      font-size: 13px;
      font-weight: 500;
      color: var(--art-gray-900);
    }

    &__time {
      font-size: 11px;
      color: var(--art-gray-400);
    }
  }

  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .todo-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;

    &__dot {
      flex: none;
      width: 6px;
      height: 6px;
      margin-top: 7px;
      border-radius: 50%;

      &.is-warning {
        background: var(--el-color-warning);
      }

      &.is-danger {
        background: var(--el-color-danger);
      }

      &.is-info {
        background: var(--art-primary);
      }
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__title {
      font-size: 13px;
      color: var(--art-gray-800);
    }

    &__desc {
      font-size: 11px;
      color: var(--art-gray-500);
    }
  }
</style>
