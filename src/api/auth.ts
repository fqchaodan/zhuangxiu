/**
 * 本地会话接口
 *
 * 本项目为纯前端单机应用，不依赖后端服务。
 * 这里以本地桩替代真实登录接口，保持与模板原有守卫、菜单加载逻辑完全兼容。
 * 后续若接入后端，只需把两个函数换成 request 调用即可。
 */

/** 本地用户：拥有全部菜单权限 */
const LOCAL_USER: Api.Auth.UserInfo = {
  userId: 1,
  userName: '屋主',
  email: 'home@local',
  roles: ['R_SUPER'],
  buttons: []
}

/**
 * 登录（本地固定返回令牌）
 */
export function fetchLogin(_params: Api.Auth.LoginParams): Promise<Api.Auth.LoginResponse> {
  return Promise.resolve({
    token: 'local-access-token',
    refreshToken: 'local-refresh-token'
  })
}

/**
 * 获取用户信息（本地固定返回超级管理员）
 */
export function fetchGetUserInfo(): Promise<Api.Auth.UserInfo> {
  return Promise.resolve({ ...LOCAL_USER })
}
