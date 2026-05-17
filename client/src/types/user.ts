export interface User {
  id: number
  email: string
  name: string
  profileImage: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}
