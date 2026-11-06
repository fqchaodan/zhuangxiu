<!-- 分类树：左侧导航，支持搜索与条目数量统计 -->
<template>
  <div class="category-tree">
    <div class="category-tree__head">
      <span class="text-sm font-medium">{{ title }}</span>
      <ElTag v-if="totalCount" size="small" type="info" effect="plain">{{ totalCount }}</ElTag>
    </div>

    <ElInput v-model="keyword" placeholder="搜索分类" clearable size="small" class="mb-2">
      <template #prefix>
        <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
      </template>
    </ElInput>

    <div class="category-tree__all" :class="{ active: !modelValue }" @click="selectAll">
      <ArtSvgIcon icon="ri:apps-2-line" />
      <span>全部</span>
      <span class="count">{{ totalCount }}</span>
    </div>

    <ElScrollbar class="category-tree__body">
      <ElTree
        :data="treeDataFiltered"
        node-key="key"
        :props="{ label: 'label', children: 'children' }"
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        highlight-current
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="tree-node__label">{{ data.label }}</span>
            <span v-if="data.count" class="tree-node__count">{{ data.count }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { categoryTree, hardTree, isUnderCategory, softTree } from '@/config/taxonomy'
  import { useRenovationStore } from '@/store/modules/renovation'
  import type { CategoryNode } from '@/config/taxonomy'
  import type { SideType } from '@/types/renovation'

  interface TreeNode extends Omit<CategoryNode, 'children'> {
    count: number
    children?: TreeNode[]
  }

  const props = withDefaults(
    defineProps<{
      modelValue: string
      side?: SideType | 'all'
      title?: string
      /** 只展示某个分类子树（用于硬装/软装子页） */
      rootKey?: string
    }>(),
    {
      side: 'all',
      title: '分类',
      rootKey: ''
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const store = useRenovationStore()
  const keyword = ref('')

  const sourceTree = computed(() => {
    const base = props.side === 'hard' ? hardTree : props.side === 'soft' ? softTree : categoryTree
    if (!props.rootKey) return base
    const root = base.find((node) => node.key === props.rootKey)
    return root?.children?.length ? root.children : root ? [root] : base
  })

  /** 统计每个分类下的条目数（含子类） */
  const countMap = computed(() => {
    const map = new Map<string, number>()
    store.items.forEach((item) => {
      const parts = item.categoryKey.split('.')
      for (let i = 2; i <= parts.length; i += 1) {
        const key = parts.slice(0, i).join('.')
        map.set(key, (map.get(key) || 0) + 1)
      }
    })
    return map
  })

  const buildTree = (nodes: CategoryNode[]): TreeNode[] =>
    nodes.map((node) => ({
      ...node,
      count: countMap.value.get(node.key) || 0,
      children: node.children ? buildTree(node.children) : undefined
    }))

  const treeData = computed(() => buildTree(sourceTree.value))

  const totalCount = computed(
    () =>
      store.items.filter((item) => {
        if (props.side !== 'all' && item.side !== props.side) return false
        if (props.rootKey && !isUnderCategory(item.categoryKey, props.rootKey)) return false
        return true
      }).length
  )

  const expandedKeys = computed(() => sourceTree.value.map((node) => node.key))

  /** 关键字过滤：保留命中节点及其父级 */
  const treeDataFiltered = computed(() => {
    const kw = keyword.value.trim()
    if (!kw) return treeData.value
    const filterNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .map((node) => {
          const children = node.children ? filterNodes(node.children) : undefined
          if (node.label.includes(kw) || (children && children.length)) {
            return { ...node, children }
          }
          return null
        })
        .filter(Boolean) as TreeNode[]
    return filterNodes(treeData.value)
  })

  function handleNodeClick(node: TreeNode): void {
    emit('update:modelValue', node.key)
  }

  function selectAll(): void {
    emit('update:modelValue', '')
  }
</script>

<style scoped lang="scss">
  .category-tree {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 14px 10px 10px 14px;

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 4px;
      margin-bottom: 10px;
    }

    &__all {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--art-gray-700);
      cursor: pointer;
      border-radius: 6px;

      &:hover {
        background: var(--art-hover-color);
      }

      &.active {
        color: var(--art-primary);
        background: var(--el-color-primary-light-9);
      }

      .count {
        margin-left: auto;
        font-size: 12px;
        color: var(--art-gray-500);
      }
    }

    &__body {
      flex: 1;
      min-height: 0;
    }

    :deep(.el-tree) {
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      height: 34px;
      border-radius: 6px;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 6px;
    font-size: 13px;

    &__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__count {
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }
</style>
