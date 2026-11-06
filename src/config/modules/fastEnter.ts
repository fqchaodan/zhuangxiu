/**
 * 快速入口配置
 * 全部指向本项目已注册的业务路由
 */
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '首页看板',
      description: '预算、结构与进度概览',
      icon: 'ri:dashboard-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'RenovationDashboard'
    },
    {
      name: '汇总',
      description: '硬装与软装全量台账',
      icon: 'ri:file-list-3-line',
      iconColor: '#13DEB9',
      enabled: true,
      order: 2,
      routeName: 'RenovationSummary'
    },
    {
      name: '主材',
      description: '瓷砖、地板、卫浴等',
      icon: 'ri:home-4-line',
      iconColor: '#ffb100',
      enabled: true,
      order: 3,
      routeName: 'HardMain'
    },
    {
      name: '家电',
      description: '大家电与小家电',
      icon: 'ri:tv-2-line',
      iconColor: '#7A7FFF',
      enabled: true,
      order: 4,
      routeName: 'SoftAppliance'
    },
    {
      name: '公司对比',
      description: '报价与辅材逐项对比',
      icon: 'ri:building-2-line',
      iconColor: '#ff6b6b',
      enabled: true,
      order: 5,
      routeName: 'CompanyCompare'
    },
    {
      name: '预算与合同',
      description: '付款节点与合同金额',
      icon: 'ri:money-cny-circle-line',
      iconColor: '#38C0FC',
      enabled: true,
      order: 6,
      routeName: 'ProcessBudget'
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '问题整改',
      enabled: true,
      order: 1,
      routeName: 'ProcessIssue'
    },
    {
      name: '进度验收',
      enabled: true,
      order: 2,
      routeName: 'ProcessProgress'
    },
    {
      name: '供应商',
      enabled: true,
      order: 3,
      routeName: 'ProcessVendor'
    },
    {
      name: '数据管理',
      enabled: true,
      order: 4,
      routeName: 'SystemData'
    }
  ]
}

export default Object.freeze(fastEnterConfig)
