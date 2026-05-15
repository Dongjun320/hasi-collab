import client from './client'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),

  register: (data: { email: string; password: string; name: string }) =>
    client.post('/auth/register', data),

  verifyEmail: (code: string) =>
    client.post('/auth/verify-email', { code }),

  logout: () =>
    client.post('/auth/logout'),
}
