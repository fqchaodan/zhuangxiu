import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store' // Store
import { initRouter } from './router' // Router
import language from './locales' // 国际化
import '@styles/core/tailwind.css' // tailwind
import '@styles/index.scss' // 样式
import '@utils/sys/console.ts' // 控制台输出内容
import '@utils/ui/iconify-loader' // 离线图标
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import { useUserStore } from './store/modules/user'
import { useRenovationStore } from './store/modules/renovation'
import { useSettingStore } from './store/modules/setting'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)

// 本地单机模式：启动即注入本地会话，跳过登录页
const userStore = useUserStore()
userStore.setToken('local-access-token', 'local-refresh-token')
userStore.setLoginStatus(true)

// 首次启动写入基础数据（房间、公司报价、阶段、付款节点）
useRenovationStore().ensureSeed()

// 关闭模板新手引导气泡
useSettingStore().hideSettingGuide()

initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(language)
app.mount('#app')
