<!-- 系统 logo：本地单机版使用文字标记，避免依赖图片资源 -->
<template>
  <div class="flex-cc">
    <div class="logo-mark" :style="logoStyle">
      <span>筑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  const logoStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    fontSize: `${Number(props.size) * 0.5}px`
  }))
</script>

<style scoped lang="scss">
  .logo-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #fff;
    letter-spacing: 1px;
    user-select: none;
    background: var(--art-primary);
    border-radius: 10px;
  }
</style>
