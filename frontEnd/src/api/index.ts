import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

/** 后端统一响应格式 — 根据实际后端调整 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 60_000, // 请求超时
  headers: { 'Content-Type': 'application/json' },
})

/* ---------- 请求拦截 ---------- */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ---------- 响应拦截 ---------- */
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    // 根据实际后端约定判断成功
    if (data.code !== undefined && data.code !== 0) {
      console.error('[API Error]', data.message)
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // 可在此处跳转登录页
    }
    console.error('[HTTP Error]', error.message)
    return Promise.reject(error)
  },
)

export default instance
