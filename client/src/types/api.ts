// 백엔드 ApiResponse<T> 와 동일한 구조
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: {
    code: string
    message: string
  } | null
}
