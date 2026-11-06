/**
 * 离线图标加载器
 *
 * 项目全部图标来自 Remix Icon。默认从 CDN 拉取，离线或内网环境会失败，
 * 这里把图标集直接打包进产物，保证断网可用。
 *
 * 新增图标集时：
 * 1. pnpm add -D @iconify-json/[icon-set-name]
 * 2. 在此导入并 addCollection
 *
 * @module utils/ui/iconify-loader
 */
import { addCollection } from '@iconify/vue'
import riIcons from '@iconify-json/ri/icons.json'

addCollection(riIcons)
