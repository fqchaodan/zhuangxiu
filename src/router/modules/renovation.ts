import { AppRouteRecord } from '@/types/router'

/**
 * 装修台账路由
 *
 * 约定：
 * - 一级菜单直接对应业务模块，最多再挂一层子菜单
 * - component 路径相对 src/views，可省略 /index
 * - 路由 name 与页面组件 name 保持一致，keepAlive 才能命中
 */
export const renovationRoutes: AppRouteRecord[] = [
  {
    path: '/dashboard',
    name: 'RenovationDashboard',
    component: '/renovation/dashboard',
    meta: {
      title: '首页看板',
      icon: 'ri:dashboard-line',
      fixedTab: true,
      keepAlive: false
    }
  },
  {
    path: '/summary',
    name: 'RenovationSummary',
    component: '/renovation/summary',
    meta: {
      title: '汇总',
      icon: 'ri:file-list-3-line',
      keepAlive: true
    }
  },
  {
    path: '/hard',
    name: 'HardWare',
    component: '/index/index',
    meta: {
      title: '硬装',
      icon: 'ri:hammer-line'
    },
    children: [
      {
        path: 'hvac',
        name: 'HardHvac',
        component: '/renovation/hard/hvac',
        meta: { title: '暖通', icon: 'ri:temp-cold-line', keepAlive: true }
      },
      {
        path: 'door-window',
        name: 'HardDoorWindow',
        component: '/renovation/hard/door-window',
        meta: { title: '门窗', icon: 'ri:door-open-line', keepAlive: true }
      },
      {
        path: 'main',
        name: 'HardMain',
        component: '/renovation/hard/main',
        meta: { title: '主材', icon: 'ri:home-4-line', keepAlive: true }
      },
      {
        path: 'aux',
        name: 'HardAux',
        component: '/renovation/hard/auxiliary',
        meta: { title: '辅材', icon: 'ri:tools-line', keepAlive: true }
      },
      {
        path: 'custom',
        name: 'HardCustom',
        component: '/renovation/hard/custom',
        meta: { title: '全屋定制', icon: 'ri:archive-line', keepAlive: true }
      },
      {
        path: 'furniture',
        name: 'HardFurniture',
        component: '/renovation/hard/furniture',
        meta: { title: '成品家具', icon: 'ri:sofa-line', keepAlive: true }
      }
    ]
  },
  {
    path: '/soft',
    name: 'SoftWare',
    component: '/index/index',
    meta: {
      title: '软装',
      icon: 'ri:plant-line'
    },
    children: [
      {
        path: 'appliance',
        name: 'SoftAppliance',
        component: '/renovation/soft/appliance',
        meta: { title: '家电', icon: 'ri:tv-2-line', keepAlive: true }
      },
      {
        path: 'smart',
        name: 'SoftSmart',
        component: '/renovation/soft/smart',
        meta: { title: '智能家居', icon: 'ri:robot-2-line', keepAlive: true }
      },
      {
        path: 'decor',
        name: 'SoftDecor',
        component: '/renovation/soft/decor',
        meta: { title: '装饰', icon: 'ri:plant-line', keepAlive: true }
      }
    ]
  },
  {
    path: '/company',
    name: 'Company',
    component: '/index/index',
    meta: {
      title: '装修公司对比',
      icon: 'ri:building-2-line'
    },
    children: [
      {
        path: 'list',
        name: 'CompanyList',
        component: '/renovation/company/list',
        meta: { title: '公司档案', icon: 'ri:contacts-book-2-line', keepAlive: true }
      },
      {
        path: 'compare',
        name: 'CompanyCompare',
        component: '/renovation/company/compare',
        meta: { title: '报价对比', icon: 'ri:bar-chart-box-line', keepAlive: true }
      }
    ]
  },
  {
    path: '/process',
    name: 'Process',
    component: '/index/index',
    meta: {
      title: '过程管理',
      icon: 'ri:calendar-todo-line'
    },
    children: [
      {
        path: 'budget',
        name: 'ProcessBudget',
        component: '/renovation/process/budget',
        meta: { title: '预算与合同', icon: 'ri:money-cny-circle-line', keepAlive: true }
      },
      {
        path: 'progress',
        name: 'ProcessProgress',
        component: '/renovation/process/progress',
        meta: { title: '进度与验收', icon: 'ri:route-line', keepAlive: true }
      },
      {
        path: 'issue',
        name: 'ProcessIssue',
        component: '/renovation/process/issue',
        meta: { title: '问题整改', icon: 'ri:error-warning-line', keepAlive: true }
      },
      {
        path: 'vendor',
        name: 'ProcessVendor',
        component: '/renovation/process/vendor',
        meta: { title: '供应商通讯录', icon: 'ri:user-location-line', keepAlive: true }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: '/index/index',
    meta: {
      title: '系统',
      icon: 'ri:settings-4-line'
    },
    children: [
      {
        path: 'data',
        name: 'SystemData',
        component: '/renovation/system/data',
        meta: { title: '数据管理', icon: 'ri:database-2-line', keepAlive: true }
      }
    ]
  }
]
