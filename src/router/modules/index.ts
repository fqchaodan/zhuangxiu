import { AppRouteRecord } from '@/types/router'
import { renovationRoutes } from './renovation'

/**
 * 导出所有模块化路由
 *
 * 本项目只保留装修台账业务路由，模板演示路由已移除。
 */
export const routeModules: AppRouteRecord[] = [...renovationRoutes]
