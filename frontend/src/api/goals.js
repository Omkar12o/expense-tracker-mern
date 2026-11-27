import client from './client';

export const goalsApi = {
  async list() {
    const { data } = await client.get('/goals');
    return data.data;
  },
  async create(payload) {
    const { data } = await client.post('/goals', payload);
    return data.data.goal;
  },
  async update(id, payload) {
    const { data } = await client.patch(`/goals/${id}`, payload);
    return data.data.goal;
  },
  async contribute(id, amount) {
    const { data } = await client.post(`/goals/${id}/contribute`, { amount });
    return data.data.goal;
  },
  async remove(id) {
    await client.delete(`/goals/${id}`);
  },
};
