import client from './client';

export const analyticsApi = {
  async get(range = 'month') {
    const { data } = await client.get('/analytics', { params: { range } });
    return data.data;
  },
};
