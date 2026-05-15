import client from './client'

export const workspaceApi = {
  getList: () => client.get('/workspaces'),
  getOne: (id: number) => client.get(`/workspaces/${id}`),
  getChannels: (workspaceId: number) =>
    client.get(`/workspaces/${workspaceId}/channels`),
}
