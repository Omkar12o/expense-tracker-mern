import client from './client';

export const dashboardApi = {
  async get() {
    const { data } = await client.get('/dashboard');
    return data.data;
  },
};
